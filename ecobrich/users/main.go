package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type UserProfile struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Email   string  `json:"email"`
	Points  float64 `json:"points"`
	TotalKg float64 `json:"totalKg"`
	Status  string  `json:"status"`
}

type UsersResponse struct {
	Users []UserProfile `json:"users"`
	Count int           `json:"count"`
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
	// 1. Authorization Check: Ensure the caller is an Admin
	claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		return response(401, "Unauthorized"), nil
	}

	// Check for 'cognito:groups' claim
	groups, ok := claims["cognito:groups"]
	isAdmin := false
	if ok {
		groupList, ok := groups.([]interface{})
		if ok {
			for _, g := range groupList {
				if str, ok := g.(string); ok && strings.EqualFold(str, "admin") {
					isAdmin = true
					break
				}
			}
		}

		if !isAdmin {
			groupsText := strings.ToLower(fmt.Sprintf("%v", groups))
			if strings.Contains(groupsText, "admin") {
				isAdmin = true
			}
		}
	}

	if !isAdmin {
		return response(403, "Access Denied: Admins only"), nil
	}

	// 2. Query all user profiles from DynamoDB
	// Use Scan to get all items
	scanInput := &dynamodb.ScanInput{
		TableName: &tableName,
	}

	result, err := dbClient.Scan(ctx, scanInput)
	if err != nil {
		fmt.Println("DynamoDB Scan Error:", err)
		return response(500, "Error querying users"), nil
	}

	// 3. Parse results and filter for PROFILE items
	var users []UserProfile
	for _, item := range result.Items {
		var sk, pk, name, email string
		var totalPoints, totalKg float64
		var status string

		if v, ok := item["SK"].(*types.AttributeValueMemberS); ok {
			sk = v.Value
		}
		if v, ok := item["PK"].(*types.AttributeValueMemberS); ok {
			pk = v.Value
		}

		// Only include PROFILE items
		if sk != "PROFILE" {
			continue
		}

		if v, ok := item["Name"].(*types.AttributeValueMemberS); ok {
			name = v.Value
		}
		if v, ok := item["Email"].(*types.AttributeValueMemberS); ok {
			email = v.Value
		}
		if v, ok := item["TotalPoints"].(*types.AttributeValueMemberN); ok {
			fmt.Sscanf(v.Value, "%f", &totalPoints)
		}
		if v, ok := item["TotalKg"].(*types.AttributeValueMemberN); ok {
			fmt.Sscanf(v.Value, "%f", &totalKg)
		}
		if v, ok := item["Status"].(*types.AttributeValueMemberS); ok {
			status = v.Value
		} else {
			status = "active"
		}

		// Extract userID from PK
		userID := ""
		if len(pk) > 5 {
			userID = pk[5:] // Remove "USER#" prefix
		}

		users = append(users, UserProfile{
			ID:      userID,
			Name:    name,
			Email:   email,
			Points:  totalPoints,
			TotalKg: totalKg,
			Status:  status,
		})
	}

	// 4. Return response
	resp := UsersResponse{
		Users: users,
		Count: len(users),
	}

	if resp.Users == nil {
		resp.Users = []UserProfile{}
	}

	responseBody, _ := json.Marshal(resp)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: string(responseBody),
	}, nil
}

func response(statusCode int, message string) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: fmt.Sprintf(`{"message":"%s"}`, message),
	}
}

func main() {
	lambda.Start(handleRequest)
}
