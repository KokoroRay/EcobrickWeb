package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"sort"
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

	// Extract User ID from Token for Points calculation
	userID := ""
	if claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{}); ok {
		if sub, ok := claims["sub"].(string); ok {
			userID = sub
		}
	}

	if method == "GET" {
		return listVouchers(ctx, headers, userID)
	}

	if method == "POST" {
		return createVoucher(ctx, request, headers)
	}

	return events.APIGatewayProxyResponse{StatusCode: 405, Body: `{"message":"Method Not Allowed"}`, Headers: headers}, nil
}

type ListResponse struct {
	Vouchers    []Voucher          `json:"vouchers"`
	UserPoints  float64            `json:"user_points"`
	UserTotalKg float64            `json:"user_total_kg"`
	History     []HistoryListEntry `json:"history"`
}

type HistoryListEntry struct {
	ID        string  `json:"id"`
	Type      string  `json:"type"`
	Kg        float64 `json:"kg"`
	Points    float64 `json:"points"`
	Note      string  `json:"note"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}

func listVouchers(ctx context.Context, headers map[string]string, userID string) (events.APIGatewayProxyResponse, error) {
	// 1. Scan Vouchers
	out, err := dbClient.Scan(ctx, &dynamodb.ScanInput{
		TableName:        aws.String(tableName),
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

	// 2. Calculate User Points if Logged In
	userPoints := 0.0
	userTotalKg := 0.0
	history := []HistoryListEntry{}
	if userID != "" {
		pOut, err := dbClient.Query(ctx, &dynamodb.QueryInput{
			TableName:              aws.String(tableName),
			KeyConditionExpression: aws.String("PK = :pk"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":pk": &types.AttributeValueMemberS{Value: "USER#" + userID},
			},
		})
		if err == nil {
			for _, item := range pOut.Items {
				sk := ""
				if val, ok := item["SK"].(*types.AttributeValueMemberS); ok {
					sk = val.Value
				}

				if sk == "PROFILE" {
					if kgVal, ok := item["TotalKg"].(*types.AttributeValueMemberN); ok {
						kg, _ := strconv.ParseFloat(kgVal.Value, 64)
						userTotalKg = kg
					}
					continue
				}

				typeValue := ""
				if val, ok := item["Type"].(*types.AttributeValueMemberS); ok {
					typeValue = strings.ToUpper(val.Value)
				}

				status := ""
				if val, ok := item["Status"].(*types.AttributeValueMemberS); ok {
					status = val.Value
				}

				createdAt := ""
				if val, ok := item["CreatedAt"].(*types.AttributeValueMemberS); ok {
					createdAt = val.Value
				}

				note := ""
				if val, ok := item["Note"].(*types.AttributeValueMemberS); ok {
					note = val.Value
				}

				kg := 0.0
				if val, ok := item["AmountKg"].(*types.AttributeValueMemberN); ok {
					kg, _ = strconv.ParseFloat(val.Value, 64)
				}

				entryPoints := 0.0
				if pVal, ok := item["PointsEarned"].(*types.AttributeValueMemberN); ok {
					p, _ := strconv.ParseFloat(pVal.Value, 64)
					entryPoints += p
					if status == "approved" || status == "" {
						userPoints += p
					}
				}
				if pVal, ok := item["PointsSpent"].(*types.AttributeValueMemberN); ok {
					p, _ := strconv.ParseFloat(pVal.Value, 64)
					entryPoints -= p
					if status == "approved" || status == "" {
						userPoints -= p
					}
				}

				historyType := ""
				switch typeValue {
				case "DONATE":
					historyType = "donate"
				case "REDEEM":
					historyType = "redeem"
				case "ADMIN_AWARD":
					historyType = "admin_adjust"
				}

				if historyType != "" {
					history = append(history, HistoryListEntry{
						ID:        sk,
						Type:      historyType,
						Kg:        kg,
						Points:    entryPoints,
						Note:      note,
						Status:    status,
						CreatedAt: createdAt,
					})
				}
			}
		}

		sort.Slice(history, func(i, j int) bool {
			return history[i].CreatedAt > history[j].CreatedAt
		})
	}

	resp := ListResponse{
		Vouchers:    vouchers,
		UserPoints:  userPoints,
		UserTotalKg: userTotalKg,
		History:     history,
	}

	body, _ := json.Marshal(resp)
	return events.APIGatewayProxyResponse{StatusCode: 200, Body: string(body), Headers: headers}, nil
}

func createVoucher(ctx context.Context, request events.APIGatewayProxyRequest, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		return events.APIGatewayProxyResponse{StatusCode: 401, Body: `{"message":"Unauthorized"}`, Headers: headers}, nil
	}

	groups, ok := claims["cognito:groups"]
	if !ok {
		return events.APIGatewayProxyResponse{StatusCode: 403, Body: `{"message":"Access Denied: Admins only"}`, Headers: headers}, nil
	}

	isAdmin := false
	if groupList, ok := groups.([]interface{}); ok {
		for _, g := range groupList {
			if str, ok := g.(string); ok && strings.EqualFold(str, "admin") {
				isAdmin = true
				break
			}
		}
	}

	if !isAdmin && strings.Contains(strings.ToLower(fmt.Sprintf("%v", groups)), "admin") {
		isAdmin = true
	}

	if !isAdmin {
		return events.APIGatewayProxyResponse{StatusCode: 403, Body: `{"message":"Access Denied: Admins only"}`, Headers: headers}, nil
	}

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
