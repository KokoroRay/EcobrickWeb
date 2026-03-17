build-DonateFunction:
	GOOS=linux GOARCH=arm64 go build -o bootstrap ./donate/main.go
	cp bootstrap $(ARTIFACTS_DIR)/
	rm bootstrap

build-AdminAwardFunction:
	GOOS=linux GOARCH=arm64 go build -o bootstrap ./admin/main.go
	cp bootstrap $(ARTIFACTS_DIR)/
	rm bootstrap

build-VouchersFunction:
	GOOS=linux GOARCH=arm64 go build -o bootstrap ./vouchers/main.go
	cp bootstrap $(ARTIFACTS_DIR)/
	rm bootstrap

build-RedeemFunction:
	GOOS=linux GOARCH=arm64 go build -o bootstrap ./redeem/main.go
	cp bootstrap $(ARTIFACTS_DIR)/
	rm bootstrap

build-UsersFunction:
	GOOS=linux GOARCH=arm64 go build -o bootstrap ./users/main.go
	cp bootstrap $(ARTIFACTS_DIR)/
	rm bootstrap