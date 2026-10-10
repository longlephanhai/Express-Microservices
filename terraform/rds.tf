# ------------------------------------------------------------------------------
# Data Sources
# ------------------------------------------------------------------------------
data "aws_availability_zones" "available" {
  state = "available"
}

# ------------------------------------------------------------------------------
# Dedicated VPC for RDS MySQL
# ------------------------------------------------------------------------------
resource "aws_vpc" "rds_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.environment}-rds-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.rds_vpc.id

  tags = {
    Name = "${var.environment}-rds-igw"
  }
}

resource "aws_subnet" "rds_subnet_1" {
  vpc_id                  = aws_vpc.rds_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment}-rds-subnet-1"
  }
}

resource "aws_subnet" "rds_subnet_2" {
  vpc_id                  = aws_vpc.rds_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment}-rds-subnet-2"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.rds_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.environment}-rds-public-rt"
  }
}

resource "aws_route_table_association" "sub1" {
  subnet_id      = aws_subnet.rds_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "sub2" {
  subnet_id      = aws_subnet.rds_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# ------------------------------------------------------------------------------
# DB Subnet Group
# ------------------------------------------------------------------------------
resource "aws_db_subnet_group" "rds" {
  name        = "${var.environment}-rds-subnet-group"
  description = "Subnet group for RDS MySQL"
  subnet_ids  = [aws_subnet.rds_subnet_1.id, aws_subnet.rds_subnet_2.id]

  tags = {
    Name = "${var.environment}-rds-subnet-group"
  }
}

# ------------------------------------------------------------------------------
# Security Group
# ------------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-sg"
  description = "Allow inbound MySQL traffic from Render and authorized networks"
  vpc_id      = aws_vpc.rds_vpc.id

  ingress {
    description = "MySQL access from allowed CIDRs"
    from_port   = var.db_port
    to_port     = var.db_port
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-rds-sg"
  }
}

# ------------------------------------------------------------------------------
# Parameter Group for MySQL 8.0
# ------------------------------------------------------------------------------
resource "aws_db_parameter_group" "mysql8" {
  name        = "${var.environment}-mysql8-params"
  family      = "mysql8.0"
  description = "Custom parameter group for MySQL 8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  tags = {
    Name = "${var.environment}-mysql8-params"
  }
}

# ------------------------------------------------------------------------------
# AWS RDS MySQL Instance (Single Instance - Standard RDS, NOT Aurora)
# ------------------------------------------------------------------------------
resource "aws_db_instance" "mysql" {
  identifier            = "${var.environment}-mysql-db"
  engine                = "mysql"
  engine_version        = "8.0"
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = var.db_port

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.mysql8.name

  publicly_accessible        = true
  skip_final_snapshot        = true
  apply_immediately          = true
  deletion_protection        = false
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.environment}-mysql-instance"
  }
}
