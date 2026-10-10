# Express Microservices with Docker

Dự án Express Microservices được đóng gói bằng Docker và Docker Compose.

---

## 🏗️ Kiến trúc các Services

| Service | Port nội bộ | Port host | Entrypoint | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **MySQL** | `3306` | `3309` (hoặc biến `DB_PORT`) | `mysql:8.0` | Cơ sở dữ liệu chính |
| **API Gateway** | `3000` | `3000` | `dist/gateway/index.js` | Reverse proxy & Swagger Docs |
| **Brand Service** | `3001` | `3001` | `dist/modules/brand/server.js` | Quản lý thương hiệu |
| **Category Service** | `3002` | `3002` | `dist/modules/category/server.js` | Quản lý danh mục |
| **Product Service** | `3003` | `3003` | `dist/modules/product/server.js` | Quản lý sản phẩm (gọi RPC Brand & Category) |
| **User Service** | `3004` | `3004` | `dist/modules/user/server.js` | Quản lý tài khoản & JWT Auth |
| **Cart Service** | `3005` | `3005` | `dist/modules/cart/server.js` | Quản lý giỏ hàng |
| **Order Service** | `3006` | `3006` | `dist/modules/orders/server.js` | Quản lý đơn hàng |

---

## 📁 Cấu trúc Docker files

```text
├── docker/
│   ├── Dockerfile.gateway
│   ├── Dockerfile.brand
│   ├── Dockerfile.category
│   ├── Dockerfile.product
│   ├── Dockerfile.user
│   ├── Dockerfile.cart
│   └── Dockerfile.order
├── .dockerignore
├── docker-compose.yml
├── .env.example
└── .env
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Cấu hình môi trường
Đảm bảo đã có file `.env` (sao chép từ `.env.example` nếu chưa có):
```bash
cp .env.example .env
```

### 2. Khởi động toàn bộ hệ thống bằng Docker Compose
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

# Xem log Database MySQL
docker compose logs -f mysql
```

### 5. Dừng hệ thống
```bash
# Dừng containers
docker compose down

# Dừng containers và xóa volume database (cẩn thận mất dữ liệu)
docker compose down -v
```

---

## 🌐 Các Endpoint quan trọng

- **API Gateway**: [http://localhost:3000](http://localhost:3000)
- **API Gateway Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Swagger UI Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Brand Service**: [http://localhost:3001/health](http://localhost:3001/health)
- **Category Service**: [http://localhost:3002/health](http://localhost:3002/health)
- **Product Service**: [http://localhost:3003/health](http://localhost:3003/product)
- **User Service**: [http://localhost:3004/health](http://localhost:3004/health)
- **Cart Service**: [http://localhost:3005/health](http://localhost:3005/health)
- **Order Service**: [http://localhost:3006/health](http://localhost:3006/health)

