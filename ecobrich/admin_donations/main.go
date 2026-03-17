package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type DonationItem struct {
	ID        string  `json:"id"`
	UserID    string  `json:"user_id"`
	UserName  string  `json:"user_name"`
	UserEmail string  `json:"user_email"`
	Kg        float64 `json:"kg"`
	Points    float64 `json:"points"`
	Note      string  `json:"note"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}

type ListResponse struct {
	Donations []DonationItem `json:"donations"`
	Count     int            `json:"count"`
}

type ReviewRequest struct {
	UserID        string `json:"user_id"`
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
}

var dbClient *dynamodb.Client
var tableName string

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic("Cannot load AWS config")
	}
	dbClient = dynamodb.NewFromConfig(cfg)
	tableName = os.Getenv("TABLE_NAME")
}

func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if !isAdmin(request) {
		return response(403, map[string]string{"message": "Access Denied: Admins only"})
	}

	headers := map[string]string{
		"Content-Type":                 "application/json",
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Headers": "Content-Type,Authorization",
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	}

	switch request.HTTPMethod {
	case "OPTIONS":
		return events.APIGatewayProxyResponse{StatusCode: 200, Headers: headers}, nil
	case "GET":
		return listPendingDonations(ctx, headers)
	case "POST":
		return reviewDonation(ctx, request, headers)
	default:
		return events.APIGatewayProxyResponse{StatusCode: 405, Headers: headers, Body: `{"message":"Method Not Allowed"}`}, nil
	}
}

func isAdmin(request events.APIGatewayProxyRequest) bool {
	claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		return false
	}

	groups, ok := claims["cognito:groups"]
	if !ok {
		return false
	}

	if groupList, ok := groups.([]interface{}); ok {
		for _, g := range groupList {
			if str, ok := g.(string); ok && strings.EqualFold(str, "admin") {
				return true
			}
		}
	}

	groupsText := strings.ToLower(fmt.Sprintf("%v", groups))
	return strings.Contains(groupsText, "admin")
}

func listPendingDonations(ctx context.Context, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	out, err := dbClient.Scan(ctx, &dynamodb.ScanInput{
		TableName:        aws.String(tableName),
		FilterExpression: aws.String("#t = :donate AND #s = :pending"),
		ExpressionAttributeNames: map[string]string{
			"#t": "Type",
			"#s": "Status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":donate":  &types.AttributeValueMemberS{Value: "DONATE"},
			":pending": &types.AttributeValueMemberS{Value: "pending"},
		},
	})
	if err != nil {
		return response(500, map[string]string{"message": "Failed to list pending donations"})
	}

	donations := make([]DonationItem, 0, len(out.Items))
	for _, item := range out.Items {
		pk, _ := item["PK"].(*types.AttributeValueMemberS)
		sk, _ := item["SK"].(*types.AttributeValueMemberS)
		if pk == nil || sk == nil {
			continue
		}

		userID := strings.TrimPrefix(pk.Value, "USER#")
		kg := parseNumber(item["AmountKg"])
		points := parseNumber(item["PointsEarned"])
		note := parseString(item["Note"])
		status := parseString(item["Status"])
		createdAt := parseString(item["CreatedAt"])

		name, email := loadProfile(ctx, pk.Value)
		if name == "" {
			name = userID
		}

		donations = append(donations, DonationItem{
			ID:        sk.Value,
			UserID:    userID,
			UserName:  name,
			UserEmail: email,
			Kg:        kg,
			Points:    points,
			Note:      note,
			Status:    status,
			CreatedAt: createdAt,
		})
	}

	resBody, _ := json.Marshal(ListResponse{Donations: donations, Count: len(donations)})
	return events.APIGatewayProxyResponse{StatusCode: 200, Headers: headers, Body: string(resBody)}, nil
}

func reviewDonation(ctx context.Context, request events.APIGatewayProxyRequest, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	var body ReviewRequest
	if err := json.Unmarshal([]byte(request.Body), &body); err != nil {
		return response(400, map[string]string{"message": "Invalid body"})
	}

	if body.UserID == "" || body.TransactionID == "" {
		return response(400, map[string]string{"message": "Missing user_id or transaction_id"})
	}

	status := strings.ToLower(body.Status)
	if status != "approved" && status != "rejected" {
		return response(400, map[string]string{"message": "Status must be approved or rejected"})
	}

	userPK := "USER#" + body.UserID
	transSK := body.TransactionID

	getOut, err := dbClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: userPK},
			"SK": &types.AttributeValueMemberS{Value: transSK},
		},
	})
	if err != nil || getOut.Item == nil {
		return response(404, map[string]string{"message": "Donation record not found"})
	}

	currentStatus := parseString(getOut.Item["Status"])
	if currentStatus != "pending" {
		return response(400, map[string]string{"message": "Donation is already reviewed"})
	}

	kg := parseNumber(getOut.Item["AmountKg"])
	points := parseNumber(getOut.Item["PointsEarned"])
	if points == 0 {
		points = kg * 10
	}

	now := time.Now().Format(time.RFC3339)

	if status == "rejected" {
		_, err = dbClient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
			TableName: aws.String(tableName),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: userPK},
				"SK": &types.AttributeValueMemberS{Value: transSK},
			},
			UpdateExpression: aws.String("SET #s = :s, ReviewedAt = :t"),
			ExpressionAttributeNames: map[string]string{
				"#s": "Status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":s": &types.AttributeValueMemberS{Value: "rejected"},
				":t": &types.AttributeValueMemberS{Value: now},
			},
		})
		if err != nil {
			return response(500, map[string]string{"message": "Failed to reject donation"})
		}

		return response(200, map[string]string{"message": "Donation rejected"})
	}

	_, err = dbClient.TransactWriteItems(ctx, &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			{
				Update: &types.Update{
					TableName: aws.String(tableName),
					Key: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: userPK},
						"SK": &types.AttributeValueMemberS{Value: transSK},
					},
					UpdateExpression: aws.String("SET #s = :s, ReviewedAt = :t"),
					ExpressionAttributeNames: map[string]string{
						"#s": "Status",
					},
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":s": &types.AttributeValueMemberS{Value: "approved"},
						":t": &types.AttributeValueMemberS{Value: now},
					},
				},
			},
			{
				Update: &types.Update{
					TableName: aws.String(tableName),
					Key: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: userPK},
						"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
					},
					UpdateExpression: aws.String("ADD TotalPoints :p, TotalKg :k SET UpdatedAt = :t"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":p": &types.AttributeValueMemberN{Value: strconv.FormatFloat(points, 'f', -1, 64)},
						":k": &types.AttributeValueMemberN{Value: strconv.FormatFloat(kg, 'f', -1, 64)},
						":t": &types.AttributeValueMemberS{Value: now},
					},
				},
			},
		},
	})
	if err != nil {
		return response(500, map[string]string{"message": "Failed to approve donation"})
	}

	return response(200, map[string]string{"message": "Donation approved"})
}

func loadProfile(ctx context.Context, userPK string) (string, string) {
	out, err := dbClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: userPK},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if err != nil || out.Item == nil {
		return "", ""
	}

	name := parseString(out.Item["Name"])
	email := parseString(out.Item["Email"])
	return name, email
}

func parseString(v types.AttributeValue) string {
	if s, ok := v.(*types.AttributeValueMemberS); ok {
		return s.Value
	}
	return ""
}

func parseNumber(v types.AttributeValue) float64 {
	if n, ok := v.(*types.AttributeValueMemberN); ok {
		f, _ := strconv.ParseFloat(n.Value, 64)
		return f
	}
	return 0
}

func response(status int, body any) (events.APIGatewayProxyResponse, error) {
	resp, _ := json.Marshal(body)
	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type,Authorization",
			"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
		},
		Body: string(resp),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
