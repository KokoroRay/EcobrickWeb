package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type AdminAwardRequest struct {
	TargetUserID string  `json:"target_user_id"`
	AmountKg     float64 `json:"amount_kg"`
	Note         string  `json:"note"`  // Lý do cộng điểm
	ManualPoints *int    `json:"manual_points,omitempty"` // Điểm nhập tay (nếu có)
}

type ResponseBody struct {
	Message      string  `json:"message"`
	PointsAwarded float64 `json:"points_awarded"`
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
		// groups can be an interface{} which is actually a []interface{} from JSON
		// We need to iterate and check for 'Admin'
		// In simple cases, it might be a list of strings.
		// AWS Cognito usually returns a list of strings for groups.
		// Safe parsing:
		groupList, ok := groups.([]interface{})
		if ok {
			for _, g := range groupList {
				if str, ok := g.(string); ok && str == "Admin" {
					isAdmin = true
					break
				}
			}
		}
		// Also handles case where it might come as a specific format depend on library/mapping
		// String check fallback just in case:
		if fmt.Sprintf("%v", groups) == "[Admin]" { 
			isAdmin = true
		}
	}

	if !isAdmin {
		// Strict check: Only Admins can use this API
		return response(403, "Access Denied: Admins only"), nil
	}

	// 2. Parse Request Body
	var req AdminAwardRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return response(400, "Invalid request body"), nil
	}

	if req.TargetUserID == "" {
		return response(400, "Missing target_user_id"), nil
	}

	// 3. Calculate Points
	var points float64
	if req.ManualPoints != nil {
		points = float64(*req.ManualPoints)
	} else {
		if req.AmountKg < 0 {
			return response(400, "AmountKg must be positive"), nil
		}
		points = req.AmountKg * 10 // Standard Formula: 1kg = 10 pts
	}

	timestamp := time.Now().Format(time.RFC3339)
	adminID := claims["sub"].(string)

	// 4. Update DynamoDB (Transaction)
	userPK := "USER#" + req.TargetUserID
	historySK := "TRANS#" + timestamp
	
	// Prepare Note
	note := req.Note
	if note == "" {
		note = fmt.Sprintf("Admin awarded points for %.1f kg plastic", req.AmountKg)
	}

	_, err := dbClient.TransactWriteItems(ctx, &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			// History Record
			{
				Put: &types.Put{
					TableName: aws.String(tableName),
					Item: map[string]types.AttributeValue{
						"PK":           &types.AttributeValueMemberS{Value: userPK},
						"SK":           &types.AttributeValueMemberS{Value: historySK},
						"Type":         &types.AttributeValueMemberS{Value: "ADMIN_AWARD"}, // Distinct type from DONATE
						"AmountKg":     &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", req.AmountKg)},
						"PointsEarned": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", points)},
						"Note":         &types.AttributeValueMemberS{Value: note},
						"AdminID":      &types.AttributeValueMemberS{Value: adminID}, // Audit trail
						"CreatedAt":    &types.AttributeValueMemberS{Value: timestamp},
						"Status":		&types.AttributeValueMemberS{Value: "approved"}, // Auto-approved
					},
				},
			},
			// Update User Profile Balance
			{
				Update: &types.Update{
					TableName: aws.String(tableName),
					Key: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: userPK},
						"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
					},
					UpdateExpression: aws.String("ADD TotalPoints :p, TotalKg :k SET UpdatedAt = :t"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":p": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", points)},
						":k": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", req.AmountKg)},
						":t": &types.AttributeValueMemberS{Value: timestamp},
					},
				},
			},
		},
	})

	if err != nil {
		fmt.Println("DynamoDB Transaction Error:", err)
		return response(500, "System Error: Failed to award points"), nil
	}

	// 5. Success Response
	resBody := ResponseBody{
		Message:       "Points awarded successfully",
		PointsAwarded: points,
	}
	jsonBody, _ := json.Marshal(resBody)

	return events.APIGatewayProxyResponse{
		Body:       string(jsonBody),
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type,Authorization",
			"Access-Control-Allow-Methods": "POST,OPTIONS",
		},
	}, nil
}

func response(status int, message string) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf(`{"message": "%s"}`, message),
		StatusCode: status,
		Headers: map[string]string{
			"Access-Control-Allow-Origin": "*",
		},
	}
}

func main() {
	lambda.Start(handleRequest)
}
