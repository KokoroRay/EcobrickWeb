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

// Cấu trúc dữ liệu nhận từ Frontend
type RequestBody struct {
	Amount float64 `json:"amount"` // Số kg nhựa
	Note   string  `json:"note"`
}

// Cấu trúc trả về
type ResponseBody struct {
	Message      string  `json:"message"`
	PointsPending float64 `json:"points_pending"`
}

var dbClient *dynamodb.Client
var tableName string

// Init chạy 1 lần khi Lambda khởi động để kết nối DB
func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic("Không thể load AWS config")
	}
	dbClient = dynamodb.NewFromConfig(cfg)
	tableName = os.Getenv("TABLE_NAME") // Biến môi trường từ template.yaml
}

func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// 1. Lấy User ID từ Claims (Token)
	claims, ok := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		return response(401, "Không tìm thấy thông tin xác thực"), nil
	}
	userID := claims["sub"].(string) 

	// 2. Parse Body lấy số kg
	var body RequestBody
	if err := json.Unmarshal([]byte(request.Body), &body); err != nil {
		return response(400, "Dữ liệu không hợp lệ"), nil
	}

	if body.Amount <= 0 {
		return response(400, "Số lượng phải lớn hơn 0"), nil
	}

	// 3. Tính điểm dự kiến (1kg = 10 điểm)
	points := body.Amount * 10
	timestamp := time.Now().Format(time.RFC3339)

	// 4. Ghi vào DynamoDB - CHỈ GHI HISTORY với Status=pending
	// Không cộng điểm ngay vào Profile
	
	userPK := "USER#" + userID
	historySK := "TRANS#" + timestamp
	
	// Default note
	note := body.Note
	if note == "" {
		note = "Quyên góp tại điểm thu gom"
	}

	_, err := dbClient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"PK":           &types.AttributeValueMemberS{Value: userPK},
			"SK":           &types.AttributeValueMemberS{Value: historySK},
			"Type":         &types.AttributeValueMemberS{Value: "DONATE"},
			"AmountKg":     &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", body.Amount)},
			"PointsEarned": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", points)},
			"Note":         &types.AttributeValueMemberS{Value: note},
			"Status":       &types.AttributeValueMemberS{Value: "pending"}, // Chờ duyệt
			"CreatedAt":    &types.AttributeValueMemberS{Value: timestamp},
		},
	})

	if err != nil {
		fmt.Println("DynamoDB Error:", err)
		return response(500, "Lỗi hệ thống khi lưu dữ liệu"), nil
	}

	// 5. Trả về thành công
	resBody := ResponseBody{
		Message:      "Quyên góp thành công",
		PointsEarned: points,
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

// Hàm helper để trả về response nhanh
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
