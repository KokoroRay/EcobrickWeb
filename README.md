# Ecobrick Web (React + TypeScript)

Website giới thiệu sản phẩm gạch tái chế và hệ thống tích điểm đổi ưu đãi. Giao diện được chuyển đổi từ bộ HTML gốc sang React + TypeScript, tối ưu cho việc tích hợp backend AWS (Cognito + API Gateway + Lambda) theo [ecobrich/template.yaml](../ecobrich/template.yaml).

## Tính năng chính

- Trang giới thiệu, sản phẩm, quy trình, liên hệ.
- Đăng nhập / đăng ký (UI chuẩn bị cho Cognito).
- Điểm thưởng: quy đổi kg nhựa → điểm, lịch sử tích điểm.
- Đổi điểm lấy voucher, quản lý voucher đã nhận.
- Dashboard admin: chỉnh quy đổi điểm, quản lý voucher, thống kê nhựa.

## Cấu trúc môi trường

Tạo file `.env` dựa trên `.env.example`:

```
VITE_API_BASE_URL=
VITE_AWS_REGION=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
```

Các biến này sẽ lấy từ output của CloudFormation/SAM trong backend:

- `ApiEndpoint`
- `UserPoolId`
- `UserPoolClientId`
- `Region`

## Chạy dự án

```
npm install
npm run dev
```

## Build

```
npm run build
npm run preview
```

## Deploy AWS (gợi ý)

### Backend (SAM)

```
cd ../ecobrich
sam build
sam deploy --guided
```

### Frontend (S3 + CloudFront)

1. Tạo S3 bucket và bật Static Website Hosting.
2. Build frontend (`npm run build`).
3. Upload thư mục `dist/` lên bucket.
4. (Tuỳ chọn) Tạo CloudFront distribution trỏ đến bucket.
5. Cập nhật CORS của API Gateway (đã mở trong template) khi có domain chính thức.

## Tích hợp API

Các hàm gọi API được chuẩn bị tại [src/services/api.ts](src/services/api.ts). Khi backend sẵn sàng, chỉ cần cập nhật `.env` để kết nối thật.
