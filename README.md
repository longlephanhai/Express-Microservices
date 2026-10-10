# Express Microservices with Docker, AWS RDS & Render

Dự án Express Microservices được đóng gói bằng Docker và hỗ trợ triển khai hạ tầng đám mây (AWS RDS MySQL + Render) thông qua **Terraform**.

---

## 🏗️ Kiến trúc các Services

| Service | Port nội bộ | Port host | Entrypoint | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `3000` | `3000` | `dist/gateway/index.js` | Reverse proxy & Swagger Docs |
| **Brand Service** | `3001` | `3001` | `dist/modules/brand/server.js` | Quản lý thương hiệu |
| **Category Service** | `3002` | `3002` | `dist/modules/category/server.js` | Quản lý danh mục |
| **Product Service** | `3003` | `3003` | `dist/modules/product/server.js` | Quản lý sản phẩm (gọi RPC Brand & Category) |
| **User Service** | `3004` | `3004` | `dist/modules/user/server.js` | Quản lý tài khoản & JWT Auth |
| **Cart Service** | `3005` | `3005` | `dist/modules/cart/server.js` | Quản lý giỏ hàng |
| **Order Service** | `3006` | `3006` | `dist/modules/orders/server.js` | Quản lý đơn hàng |
| **AWS RDS MySQL** | `3306` | `3306` | Managed RDS Instance | Cơ sở dữ liệu chính (Terraform, không dùng Aurora) |

---

## 📁 Cấu trúc Thư mục

```text
├── docker/                  # Dockerfiles cho từng microservice
│   ├── Dockerfile.gateway
│   ├── Dockerfile.brand
│   ├── Dockerfile.category
│   ├── Dockerfile.product
│   ├── Dockerfile.user
│   ├── Dockerfile.cart
│   └── Dockerfile.order
├── terraform/               # Mã nguồn Terraform triển khai RDS & Render
│   ├── main.tf
│   ├── variables.tf
│   ├── rds.tf
│   ├── render.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   └── README.md
├── docker-compose.yml       # Docker Compose cho các microservice (kết nối RDS)
├── .env.example
└── .env
```

---

## ☁️ Triển khai Hạ tầng Đám mây với Terraform

MySQL không còn chạy trong Docker container cục bộ mà được triển khai trên **AWS RDS MySQL** (Standard RDS, không dùng Aurora). Các microservices có thể được triển khai tự động lên **Render**.

Chi tiết xem tại [terraform/README.md](file:///home/long/express-microservices/terraform/README.md).

Tóm tắt các bước:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Điền thông tin AWS credentials, DB password và Render API key vào terraform.tfvars
terraform init
terraform apply
```

---

## 🚀 Khởi chạy Microservices bằng Docker Compose (Local)

### 1. Cấu hình môi trường
Đảm bảo đã có file `.env` với `DB_HOST` trỏ đến endpoint của AWS RDS MySQL:
```bash
cp .env.example .env
# Chỉnh sửa DB_HOST, DB_PASSWORD theo RDS vừa tạo
```

### 2. Khởi động các microservices
```bash
# Build và chạy ngầm (detached mode)
docker compose up -d --build

# Hoặc chạy và xem logs trực tiếp
docker compose up --build
```

### 3. Kiểm tra trạng thái containers
```bash
docker compose ps
```

### 4. Xem logs của một service cụ thể
```bash
# Xem log API Gateway
docker compose logs -f api-gateway

# Xem log Product Service
docker compose logs -f product-service
```

### 5. Dừng hệ thống
```bash
docker compose down
```

---

## 🌐 Các Endpoint quan trọng

- **API Gateway**: [http://localhost:3000](http://localhost:3000)
- **API Gateway Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Swagger UI Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Brand Service**: [http://localhost:3001/health](http://localhost:3001/health)
- **Category Service**: [http://localhost:3002/health](http://localhost:3002/health)
- **Product Service**: [http://localhost:3003/product](http://localhost:3003/product)
- **User Service**: [http://localhost:3004/health](http://localhost:3004/health)
- **Cart Service**: [http://localhost:3005/health](http://localhost:3005/health)
- **Order Service**: [http://localhost:3006/health](http://localhost:3006/health)
