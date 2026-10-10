aws_region  = "ap-southeast-1"
environment = "prod"


db_name                 = "mysqlDatabase"
db_username             = "admin"
db_password             = "log!1234"
db_instance_class       = "db.t3.micro"             
db_allocated_storage    = 20                       
db_max_allocated_storage= 100                    
db_port                 = 3306

allowed_cidr_blocks     = ["0.0.0.0/0"]

enable_render   = true
render_api_key  = "rnd_ZkduUJ4jq6vibBwdb3CGf9ZQ2gqR"
render_owner_id = "usr-coa22qvsc6pc7399sang"

render_region   = "singapore"
render_plan     = "free"


repo_url        = "https://github.com/longlephanhai/Express-Microservices"
repo_branch     = "dev"

jwt_secret      = "just_jwt_secret_key"
expiration_time = "1h"

