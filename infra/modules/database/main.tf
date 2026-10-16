terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_db_instance" "postgres" {
  identifier        = "${var.app_name}-${var.environment}-postgres"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  skip_final_snapshot = var.environment != "prod"
  deletion_protection = var.environment == "prod"
  storage_encrypted   = true

  tags = {
    Name = "${var.app_name}-${var.environment}-database"
  }
}
