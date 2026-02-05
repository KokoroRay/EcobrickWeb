build-DonateFunction:
	GOOS=linux GOARCH=arm64 go build -o bootstrap ./donate/main.go
	cp bootstrap $(ARTIFACTS_DIR)/
	rm bootstrap