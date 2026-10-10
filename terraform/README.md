# Triển khai AWS RDS MySQL & Render Microservices bằng Terraform

Dự án này sử dụng Terraform để tự động hóa:
1. **AWS RDS MySQL**: Cơ sở dữ liệu MySQL 8.0 độc lập (chuẩn Standard RDS Instance, **không dùng Aurora**) kèm VPC, Subnets và Security Group riêng biệt.
2. **Render Microservices**: Tự động triển khai 7 dịch vụ (6 Microservices + 1 API Gateway) lên nền tảng đám mây [Render.com](https://render.com/) sử dụng Terraform Provider `render-oss/render`.

---

## 📋 Yêu cầu tiên quyết

- **Terraform** >= 1.5.0
- **AWS Account** đã được cấu hình credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, hoặc `aws configure`).
- **Render Account** với API Key và Workspace/Owner ID (lấy tại Render Dashboard -> Account Settings -> API Keys).

---

## 🛠️ Cấu trúc thư mục Terraform

```text
terraform/
├── main.tf                  # Khai báo providers (AWS & Render)
├── variables.tf             # Định nghĩa các biến cấu hình
├── rds.tf                   # VPC, Subnet Group, Security Group và RDS MySQL instance
├── render.tf                # Khai báo 7 Web Services trên Render (Docker runtime)
├── outputs.tf               # Các giá trị đầu ra (RDS endpoint, Service URLs, mẫu .env)
├── terraform.tfvars.example # File mẫu cấu hình biến
└── README.md                # Tài liệu hướng dẫn
```

---

## 🚀 Các bước triển khai

### Bước 1: Chuẩn bị file biến `terraform.tfvars`

Di chuyển vào thư mục `terraform` và copy file cấu hình mẫu:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Mở `terraform.tfvars` và điều chỉnh các giá trị:
- `aws_region`: Khu vực AWS (ví dụ: `ap-southeast-1` hoặc `us-east-1`).
- `db_username`: Tên user quản trị DB (ví dụ: `admin`).
- `db_password`: Mật khẩu an toàn cho RDS MySQL.
- `render_api_key`: API key của Render (bắt đầu bằng `rnd_...`).
- `render_owner_id`: Owner/Workspace ID trên Render.
- `repo_url`: Đường dẫn Git repo (GitHub/GitLab) chứa source code để Render build Docker container.

> **Mẹo**: Nếu bạn chỉ muốn tạo RDS trước mà chưa muốn tạo Render, bạn có thể đặt `enable_render = false` trong `terraform.tfvars`.

### Bước 2: Khởi tạo Terraform

```bash
terraform init
```

### Bước 3: Xem trước kế hoạch triển khai (Plan)

```bash
terraform plan
```

### Bước 4: Áp dụng triển khai (Apply)

```bash
terraform apply
```
Gõ `yes` khi được hỏi để xác nhận tạo hạ tầng. Quá trình tạo RDS MySQL thường mất khoảng 3 - 5 phút.

### Bước 5: Xem kết quả đầu ra

Sau khi hoàn thành, Terraform sẽ hiển thị:
- `rds_address`: Địa chỉ Host của RDS MySQL.
- `rds_endpoint`: Host:Port của RDS MySQL.
- `api_gateway_url`: URL công khai của API Gateway trên Render.
- `render_services`: Danh sách URL của các microservice.
- `env_config_for_local`: Mẫu cấu hình `.env` để chạy local Docker Compose kết nối trực tiếp đến RDS.

---

## 🔄 Kết nối Docker Compose ở máy local tới AWS RDS

Sau khi RDS được tạo, bạn có thể chạy các service trên máy local thông qua file `docker-compose.yml` (đã bỏ container MySQL):

1. Mở file `.env` ở thư mục gốc của project:
```env
DB_HOST=<rds_address_tu_terraform>
DB_PORT=3306
DB_USERNAME=<db_username>
DB_PASSWORD=<db_password>
DB_NAME=demo
DB_TYPE=mysql
```

2. Khởi chạy các microservice bằng Docker Compose:
```bash
docker compose up -d --build
```

---

## 🧹 Hủy hạ tầng (Destroy)

Khi không còn nhu cầu sử dụng, bạn có thể dọn dẹp toàn bộ tài nguyên:

```bash
terraform destroy
```

