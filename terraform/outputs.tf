# ------------------------------------------------------------------------------
# AWS RDS MySQL Outputs
# ------------------------------------------------------------------------------
output "rds_endpoint" {
  description = "The connection endpoint for AWS RDS MySQL (host:port)"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_address" {
  description = "The hostname / address of AWS RDS MySQL"
  value       = aws_db_instance.mysql.address
}

output "rds_port" {
  description = "The database port"
  value       = aws_db_instance.mysql.port
}

output "rds_db_name" {
  description = "The database name"
  value       = aws_db_instance.mysql.db_name
}

output "rds_username" {
  description = "The database master username"
  value       = aws_db_instance.mysql.username
}

# ------------------------------------------------------------------------------
# Render Outputs
# ------------------------------------------------------------------------------
output "api_gateway_url" {
  description = "Public URL of the API Gateway on Render"
  value       = var.enable_render ? render_web_service.gateway[0].url : null
}

output "render_services" {
  description = "Map of all microservice URLs deployed on Render"
  value = var.enable_render ? {
    api_gateway      = render_web_service.gateway[0].url
    brand_service    = render_web_service.brand[0].url
    category_service = render_web_service.category[0].url
    product_service  = render_web_service.product[0].url
    user_service     = render_web_service.user[0].url
    cart_service     = render_web_service.cart[0].url
    order_service    = render_web_service.order[0].url
  } : {}
}

output "env_config_for_local" {
  description = "Sample .env configuration to connect local docker-compose to AWS RDS"
  value       = <<EOT
DB_HOST=${aws_db_instance.mysql.address}
DB_PORT=${aws_db_instance.mysql.port}
DB_USERNAME=${aws_db_instance.mysql.username}
DB_PASSWORD=${var.db_password}
DB_NAME=${aws_db_instance.mysql.db_name}
DB_TYPE=mysql
EOT
  sensitive   = true
}
