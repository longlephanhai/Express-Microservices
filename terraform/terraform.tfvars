aws_region  = "ap-southeast-1"
environment = "prod"


db_name                 = "database-mysql"
db_username             = "admin"
db_password             = "log!1234" # Thay đổi mật khẩu an toàn
db_instance_class       = "db.t3.micro"             
db_allocated_storage    = 20                       
db_max_allocated_storage= 100                    
db_port                 = 3306

allowed_cidr_blocks     = ["0.0.0.0/0"]

enable_render   = true
# Lấy API Key từ Render Dashboard: Account Settings -> API Keys
render_api_key  = "rnd_xxxxxxxxxxxxxxxxxxxxxxxx"

# Lấy Owner ID / Workspace ID từ Render Dashboard URL (hoặc để trống nếu set qua biến môi trường)
render_owner_id = "tea-xxxxxxxxxxxxxxxx"

render_region   = "singapore"
render_plan     = "starter"

# URL repository GitHub/GitLab của bạn mà Render sẽ pull code về build Dockerfile
repo_url        = "https://github.com/your-username/express-microservices"
repo_branch     = "main"

# ==============================================================================
# Application Secrets
# ==============================================================================
jwt_secret      = "your_jwt_secret_key_here"
expiration_time = "1h"

