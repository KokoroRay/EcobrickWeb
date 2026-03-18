package main

import (
	"context"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestHandleRequest_UnauthorizedWhenNoClaims(t *testing.T) {
	request := events.APIGatewayProxyRequest{}

	response, err := handleRequest(context.Background(), request)
	if err != nil {
		t.Fatalf("Expected nil error, got %v", err)
	}

	if response.StatusCode != 401 {
		t.Fatalf("Expected status code 401, but got %v", response.StatusCode)
	}
}
