terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Production remote state storage with DynamoDB state locking
  backend "s3" {
    bucket         = "electa-tf-state-ap-southeast-1"
    key            = "electa/prod/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "electa-tf-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.app_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Module: AWS Cognito Federated Authentication (Production)
module "cognito" {
  source = "../../modules/cognito"

  app_name              = var.app_name
  environment           = var.environment
  cognito_domain_prefix = var.cognito_domain_prefix
  google_client_id      = var.google_client_id
  google_client_secret  = var.google_client_secret
  callback_urls         = var.callback_urls
  logout_urls           = var.logout_urls
}

# Module: S3 Media & Asset Storage (Production with Versioning Enabled)
module "storage" {
  source = "../../modules/storage"

  app_name             = var.app_name
  environment          = var.environment
  enable_versioning    = true
  cors_allowed_origins = var.callback_urls
}
