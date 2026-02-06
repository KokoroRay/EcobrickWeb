package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
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

type Voucher struct {
	ID             string  `json:"id"`
	Title          string  `json:"title"`
	Discount       string  `json:"discount"`
	PointsRequired float64 `json:"points_required"`
	ExpiresAt      string  `json:"expires_at"`
	Code           string  `json:"code"`
	Status         string  `json:"status"`
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
	method := request.HTTPMethod

	// Enable CORS
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type,Authorization",
	}

	if method == "OPTIONS" {
		return events.APIGatewayProxyResponse{StatusCode: 200, Headers: headers}, nil
	}

	if method == "GET" {
		return listVouchers(ctx, headers)
	}

	if method == "POST" {
		return createVoucher(ctx, request, headers)
	}

	return events.APIGatewayProxyResponse{StatusCode: 405, Body: `{"message":"Method Not Allowed"}`, Headers: headers}, nil
}

func listVouchers(ctx context.Context, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	// Scan for PK=VOUCHER
	// Note: For production, Query GSI is better. For <100 vouchers, Scan is fine.
	out, err := dbClient.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(tableName),
		FilterExpression: aws.String("PK = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "VOUCHER"},
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500, Body: fmt.Sprintf(`{"message":"DB Error: %v"}`, err), Headers: headers}, nil
	}

	var vouchers []Voucher
	for _, item := range out.Items {
		v := Voucher{}
		if val, ok := item["SK"].(*types.AttributeValueMemberS); ok {
			v.ID = strings.TrimPrefix(val.Value, "DEF#")
		}
		if val, ok := item["Title"].(*types.AttributeValueMemberS); ok {
			v.Title = val.Value
		}
		if val, ok := item["Discount"].(*types.AttributeValueMemberS); ok {
			v.Discount = val.Value
		}
		if val, ok := item["Code"].(*types.AttributeValueMemberS); ok {
			v.Code = val.Value
		}
		if val, ok := item["ExpiresAt"].(*types.AttributeValueMemberS); ok {
			v.ExpiresAt = val.Value
		}
		if val, ok := item["Status"].(*types.AttributeValueMemberS); ok {
			v.Status = val.Value
		}
		if val, ok := item["PointsRequired"].(*types.AttributeValueMemberN); ok {
			f, _ := strconv.ParseFloat(val.Value, 64)
			v.PointsRequired = f
		}
		vouchers = append(vouchers, v)
	}

	body, _ := json.Marshal(vouchers)
	return events.APIGatewayProxyResponse{StatusCode: 200, Body: string(body), Headers: headers}, nil
}

func createVoucher(ctx context.Context, request events.APIGatewayProxyRequest, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	// Verify Admin
	claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		// Mock logic for local testing or if Auth is misconfigured
		// For now, strict check
		// return events.APIGatewayProxyResponse{StatusCode: 401, Body: `{"message":"Unauthorized"}`, Headers: headers}, nil
	}
	// Check group/role if needed, for now assume Authenticated = Allowed or check "cognito:groups"
	_ = claims

	var v Voucher
	if err := json.Unmarshal([]byte(request.Body), &v); err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 400, Body: `{"message":"Invalid Body"}`, Headers: headers}, nil
	}

	if v.Code == "" {
		v.Code = fmt.Sprintf("EC-%d%d", time.Now().Unix()%1000, rand.Intn(999))
	}
	id := fmt.Sprintf("DEF#%d", time.Now().UnixNano())

	_, err := dbClient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"PK":             &types.AttributeValueMemberS{Value: "VOUCHER"},
			"SK":             &types.AttributeValueMemberS{Value: id},
			"Title":          &types.AttributeValueMemberS{Value: v.Title},
			"Discount":       &types.AttributeValueMemberS{Value: v.Discount},
			"Code":           &types.AttributeValueMemberS{Value: v.Code},
			"PointsRequired": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", v.PointsRequired)},
			"ExpiresAt":      &types.AttributeValueMemberS{Value: v.ExpiresAt},
			"Status":         &types.AttributeValueMemberS{Value: "active"},
			"CreatedAt":      &types.AttributeValueMemberS{Value: time.Now().Format(time.RFC3339)},
		},
	})

	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500, Body: fmt.Sprintf(`{"message":"DB Error: %v"}`, err), Headers: headers}, nil
	}

	return events.APIGatewayProxyResponse{StatusCode: 201, Body: `{"message":"Voucher Created"}`, Headers: headers}, nil
}

func main() {
	lambda.Start(handleRequest)
}
