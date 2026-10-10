# ------------------------------------------------------------------------------
# General Variables
# ------------------------------------------------------------------------------
variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

# ------------------------------------------------------------------------------
# AWS & RDS Variables
# ------------------------------------------------------------------------------
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "db_name" {
  description = "Database name on RDS MySQL"
  type        = string
  default     = "demo"
}

variable "db_username" {
  description = "Master username for RDS MySQL"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Master password for RDS MySQL (must be at least 8 characters)"
  type        = string
  sensitive   = true
  default     = "ChangeMe12345!"
}

variable "db_instance_class" {
  description = "RDS instance class (Standard MySQL, NOT Aurora)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for RDS MySQL"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Max allocated storage in GB for autoscaling"
  type        = number
  default     = 100
}

variable "db_port" {
  description = "Port for MySQL"
  type        = number
  default     = 3306
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to connect to RDS MySQL (e.g. 0.0.0.0/0 for public access from Render)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ------------------------------------------------------------------------------
# Render Variables
# ------------------------------------------------------------------------------
variable "enable_render" {
  description = "Set to true to deploy microservices onto Render via Terraform"
  type        = bool
  default     = true
}

variable "render_api_key" {
  description = "API key for Render (can also be supplied via RENDER_API_KEY environment variable)"
  type        = string
  sensitive   = true
  default     = null
}

variable "render_owner_id" {
  description = "Owner ID / Workspace ID on Render (can also be supplied via RENDER_OWNER_ID environment variable)"
  type        = string
  sensitive   = true
  default     = null
}

variable "render_region" {
  description = "Region on Render (oregon, ohio, frankfurt, singapore, virginia)"
  type        = string
  default     = "singapore"
}

variable "render_plan" {
  description = "Render service plan (starter, standard, pro, etc.)"
  type        = string
  default     = "starter"
}

variable "repo_url" {
  description = "Git repository URL for deploying services on Render"
  type        = string
  default     = "https://github.com/your-username/express-microservices"
}

variable "repo_branch" {
  description = "Git branch to build and deploy"
  type        = string
  default     = "main"
}

variable "jwt_secret" {
  description = "JWT Secret Key used for User service"
  type        = string
  sensitive   = true
  default     = "just_jwt_secret_key"
}

variable "expiration_time" {
  description = "Token expiration duration"
  type        = string
  default     = "1h"
}

