# ------------------------------------------------------------------------------
# Microservices on Render (Web Services)
# ------------------------------------------------------------------------------

# 1. Brand Service
resource "render_web_service" "brand" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-brand-service"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.brand"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"      = { value = "production" }
    "PORT"          = { value = "3001" }
    "BRAND_PORT"    = { value = "3001" }
    "DB_HOST"       = { value = aws_db_instance.mysql.address }
    "DB_PORT"       = { value = tostring(aws_db_instance.mysql.port) }
    "DB_USERNAME"   = { value = var.db_username }
    "DB_PASSWORD"   = { value = var.db_password }
    "DB_NAME"       = { value = var.db_name }
    "DB_BRAND_NAME" = { value = var.db_name }
    "DB_TYPE"       = { value = "mysql" }
  }
}

# 2. Category Service
resource "render_web_service" "category" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-category-service"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.category"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"         = { value = "production" }
    "PORT"             = { value = "3002" }
    "CATEGORY_PORT"    = { value = "3002" }
    "DB_HOST"          = { value = aws_db_instance.mysql.address }
    "DB_PORT"          = { value = tostring(aws_db_instance.mysql.port) }
    "DB_USERNAME"      = { value = var.db_username }
    "DB_PASSWORD"      = { value = var.db_password }
    "DB_NAME"          = { value = var.db_name }
    "DB_CATEGORY_NAME" = { value = var.db_name }
    "DB_TYPE"          = { value = "mysql" }
  }
}

# 3. User Service
resource "render_web_service" "user" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-user-service"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.user"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"        = { value = "production" }
    "PORT"            = { value = "3004" }
    "USER_PORT"       = { value = "3004" }
    "DB_HOST"         = { value = aws_db_instance.mysql.address }
    "DB_PORT"         = { value = tostring(aws_db_instance.mysql.port) }
    "DB_USERNAME"     = { value = var.db_username }
    "DB_PASSWORD"     = { value = var.db_password }
    "DB_NAME"         = { value = var.db_name }
    "DB_USER_NAME"    = { value = var.db_name }
    "DB_TYPE"         = { value = "mysql" }
    "JWT_SECRET"      = { value = var.jwt_secret }
    "EXPIRATION_TIME" = { value = var.expiration_time }
  }
}

# 4. Cart Service
resource "render_web_service" "cart" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-cart-service"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.cart"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"     = { value = "production" }
    "PORT"         = { value = "3005" }
    "CART_PORT"    = { value = "3005" }
    "DB_HOST"      = { value = aws_db_instance.mysql.address }
    "DB_PORT"      = { value = tostring(aws_db_instance.mysql.port) }
    "DB_USERNAME"  = { value = var.db_username }
    "DB_PASSWORD"  = { value = var.db_password }
    "DB_NAME"      = { value = var.db_name }
    "DB_CART_NAME" = { value = var.db_name }
    "DB_TYPE"      = { value = "mysql" }
  }
}

# 5. Order Service
resource "render_web_service" "order" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-order-service"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.order"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"      = { value = "production" }
    "PORT"          = { value = "3006" }
    "ORDER_PORT"    = { value = "3006" }
    "DB_HOST"       = { value = aws_db_instance.mysql.address }
    "DB_PORT"       = { value = tostring(aws_db_instance.mysql.port) }
    "DB_USERNAME"   = { value = var.db_username }
    "DB_PASSWORD"   = { value = var.db_password }
    "DB_NAME"       = { value = var.db_name }
    "DB_ORDER_NAME" = { value = var.db_name }
    "DB_TYPE"       = { value = "mysql" }
  }
}

# 6. Product Service (Connects to RDS and calls Brand & Category services)
resource "render_web_service" "product" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-product-service"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.product"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"             = { value = "production" }
    "PORT"                 = { value = "3003" }
    "PRODUCT_PORT"         = { value = "3003" }
    "DB_HOST"              = { value = aws_db_instance.mysql.address }
    "DB_PORT"              = { value = tostring(aws_db_instance.mysql.port) }
    "DB_USERNAME"          = { value = var.db_username }
    "DB_PASSWORD"          = { value = var.db_password }
    "DB_NAME"              = { value = var.db_name }
    "DB_PRODUCT_NAME"      = { value = var.db_name }
    "DB_TYPE"              = { value = "mysql" }
    "BRAND_SERVICE_URL"    = { value = render_web_service.brand[0].url }
    "CATEGORY_SERVICE_URL" = { value = render_web_service.category[0].url }
  }
}

# 7. API Gateway (Entrypoint for clients, proxies traffic to all microservices)
resource "render_web_service" "gateway" {
  count  = var.enable_render ? 1 : 0
  name   = "${var.environment}-api-gateway"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      auto_deploy     = true
      branch          = var.repo_branch
      repo_url        = var.repo_url
      dockerfile_path = "docker/Dockerfile.gateway"
      docker_context  = "."
    }
  }

  env_vars = {
    "NODE_ENV"             = { value = "production" }
    "PORT"                 = { value = "3000" }
    "GATEWAY_PORT"         = { value = "3000" }
    "BRAND_SERVICE_URL"    = { value = render_web_service.brand[0].url }
    "CATEGORY_SERVICE_URL" = { value = render_web_service.category[0].url }
    "PRODUCT_SERVICE_URL"  = { value = render_web_service.product[0].url }
    "USER_SERVICE_URL"     = { value = render_web_service.user[0].url }
    "CART_SERVICE_URL"     = { value = render_web_service.cart[0].url }
    "ORDER_SERVICE_URL"    = { value = render_web_service.order[0].url }
  }
}

