package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type RedeemRequest struct {
	VoucherID string `json:"voucher_id"` // format: DEF#... or just ID part
}

var dbClient *dynamodb.Client
var tableName string

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic("Config Load Failed")
	}
	dbClient = dynamodb.NewFromConfig(cfg)
	tableName = os.Getenv("TABLE_NAME")
}

func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type,Authorization",
	}

	if request.HTTPMethod == "OPTIONS" {
		return events.APIGatewayProxyResponse{StatusCode: 200, Headers: headers}, nil
	}

	// 1. Auth
	claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		return events.APIGatewayProxyResponse{StatusCode: 401, Body: `{"message":"Unauthorized"}`, Headers: headers}, nil
	}
	userID := claims["sub"].(string)

	// 2. Body
	var body RedeemRequest
	if err := json.Unmarshal([]byte(request.Body), &body); err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 400, Body: `{"message":"Invalid Body"}`, Headers: headers}, nil
	}

	// 3. Get Voucher Def
	// If ID doesn't have local prefix, maybe assume passed simplified ID?
	// Using "DEF#" + body.VoucherID if not present?
	// The List API returns simplified ID (stripped DEF#). So we should re-add it.
	voucherSK := "DEF#" + body.VoucherID
	if len(body.VoucherID) > 4 && body.VoucherID[:4] == "DEF#" {
		voucherSK = body.VoucherID
	}

	vRes, err := dbClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "VOUCHER"},
			"SK": &types.AttributeValueMemberS{Value: voucherSK},
		},
	})
	if err != nil || vRes.Item == nil {
		return events.APIGatewayProxyResponse{StatusCode: 404, Body: `{"message":"Voucher not found"}`, Headers: headers}, nil
	}

	pointsReqFunc := func() float64 {
		if val, ok := vRes.Item["PointsRequired"].(*types.AttributeValueMemberN); ok {
			f, _ := strconv.ParseFloat(val.Value, 64)
			return f
		}
		return 0
	}
	pointCost := pointsReqFunc()
	
	// Get Voucher Code/Title to copy
	voucherCode := ""
	if val, ok := vRes.Item["Code"].(*types.AttributeValueMemberS); ok {
		voucherCode = val.Value
	}
	voucherTitle := ""
	if val, ok := vRes.Item["Title"].(*types.AttributeValueMemberS); ok {
		voucherTitle = val.Value
	}
	voucherDiscount := ""
    if val, ok := vRes.Item["Discount"].(*types.AttributeValueMemberS); ok {
        voucherDiscount = val.Value
    }
    voucherExpires := ""
    if val, ok := vRes.Item["ExpiresAt"].(*types.AttributeValueMemberS); ok {
        voucherExpires = val.Value
    }

	// 4. Calculate User Points
	// Query Get All Transactions for User
	qOut, err := dbClient.Query(ctx, &dynamodb.QueryInput{
		TableName: aws.String(tableName),
		KeyConditionExpression: aws.String("PK = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "USER#" + userID},
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500, Body: `{"message":"Error fetching user data"}`, Headers: headers}, nil
	}

	totalPoints := 0.0
	for _, item := range qOut.Items {
		// History items (Donate, AdminAdjust) OR Redeem items
		// Donate: PointsEarned > 0, Status=approved
		// AdminAdjust: PointsEarned (can be pos/neg), Status=approved
		// Redeem: PointsSpent > 0 (or PointsEarned negative?)

		status := ""
		if val, ok := item["Status"].(*types.AttributeValueMemberS); ok {
			status = val.Value
		}

		// Only count approved
		if status == "approved" || status == "" { // Some records might not have status if implicit? No, all have.
			// Legacy/Donate items
			if pVal, ok := item["PointsEarned"].(*types.AttributeValueMemberN); ok {
				p, _ := strconv.ParseFloat(pVal.Value, 64)
				totalPoints += p
			}
			// Redeem items might store cost in PointsSpent
			if pVal, ok := item["PointsSpent"].(*types.AttributeValueMemberN); ok {
				p, _ := strconv.ParseFloat(pVal.Value, 64)
				totalPoints -= p
			}
		}
	}

	if totalPoints < pointCost {
		return events.APIGatewayProxyResponse{StatusCode: 400, Body: `{"message":"Not enough points"}`, Headers: headers}, nil
	}

	// 5. Transact Write: Redeem History + User Voucher
	now := time.Now().Format(time.RFC3339)
	redeemSK := "REDEEM#" + now
	userVoucherSK := "VOUCHER#" + fmt.Sprintf("%d", time.Now().UnixNano())

	_, err = dbClient.TransactWriteItems(ctx, &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			{
				Put: &types.Put{
					TableName: aws.String(tableName),
					Item: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: "USER#" + userID},
						"SK": &types.AttributeValueMemberS{Value: redeemSK},
						"Type": &types.AttributeValueMemberS{Value: "REDEEM"},
						"PointsSpent": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", pointCost)},
						"VoucherRef": &types.AttributeValueMemberS{Value: voucherSK},
						"Status": &types.AttributeValueMemberS{Value: "approved"},
						"CreatedAt": &types.AttributeValueMemberS{Value: now},
						"Note": &types.AttributeValueMemberS{Value: "Đổi voucher: " + voucherTitle},
					},
				},
			},
			{
				Put: &types.Put{
					TableName: aws.String(tableName),
					Item: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: "USER#" + userID},
						"SK": &types.AttributeValueMemberS{Value: userVoucherSK},
						"Type": &types.AttributeValueMemberS{Value: "USER_VOUCHER"},
						"Code": &types.AttributeValueMemberS{Value: voucherCode},
						"Title": &types.AttributeValueMemberS{Value: voucherTitle},
						"Discount": &types.AttributeValueMemberS{Value: voucherDiscount},
						"ExpiresAt": &types.AttributeValueMemberS{Value: voucherExpires},
						"Status": &types.AttributeValueMemberS{Value: "active"},
						"CreatedAt": &types.AttributeValueMemberS{Value: now},
					},
				},
			},
		},
	})

	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500, Body: fmt.Sprintf(`{"message":"Transaction Error: %v"}`, err), Headers: headers}, nil
	}

	return events.APIGatewayProxyResponse{StatusCode: 200, Body: `{"message":"Redeem Success"}`, Headers: headers}, nil
}

func main() {
	lambda.Start(handleRequest)
}
