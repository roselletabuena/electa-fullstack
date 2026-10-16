# Terraform Bootstrap: Remote State (S3 + DynamoDB State Locking)
# Run once per AWS account to initialize state storage for all environments.

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region for Terraform state infrastructure"
  default     = "ap-southeast-1"
}

variable "app_name" {
  type        = string
  description = "Application name"
  default     = "electa"
}

provider "aws" {
  region = var.aws_region
}

# 1. S3 Bucket for Terraform Remote State
resource "aws_s3_bucket" "tf_state" {
  bucket = "${var.app_name}-tf-state-${var.aws_region}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "tf_state_versioning" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state_encryption" {
  bucket = aws_s3_bucket.tf_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tf_state_public_access" {
  bucket = aws_s3_bucket.tf_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. DynamoDB Table for Terraform State Locking
resource "aws_dynamodb_table" "tf_locks" {
  name         = "${var.app_name}-tf-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }
}

output "state_bucket_name" {
  description = "Name of S3 bucket for Terraform remote state"
  value       = aws_s3_bucket.tf_state.bucket
}

output "dynamodb_table_name" {
  description = "Name of DynamoDB table for Terraform state locking"
  value       = aws_dynamodb_table.tf_locks.name
}
