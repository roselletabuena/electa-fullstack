terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# 1. AWS Cognito User Pool
resource "aws_cognito_user_pool" "pool" {
  name = "${var.app_name}-${var.environment}-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = var.mfa_configuration

  password_policy {
    minimum_length    = var.password_minimum_length
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
}

# 2. AWS Cognito User Pool Domain (Hosted UI)
resource "aws_cognito_user_pool_domain" "domain" {
  domain       = "${var.cognito_domain_prefix}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.pool.id
}

# 3. Google Identity Provider (Conditional on credentials being provided)
resource "aws_cognito_identity_provider" "google" {
  count         = var.google_client_id != "" && var.google_client_secret != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    authorize_scopes = "email openid profile"
  }

  attribute_mapping = {
    email    = "email"
    name     = "name"
    username = "sub"
  }
}

# 4. AWS Cognito User Pool Client
resource "aws_cognito_user_pool_client" "client" {
  name         = "${var.app_name}-${var.environment}-web-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret = false # Frontend SPA/Next.js client

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  supported_identity_providers = var.google_client_id != "" && var.google_client_secret != "" ? [
    "COGNITO",
    "Google"
  ] : ["COGNITO"]

  prevent_user_existence_errors = "ENABLED"

  depends_on = [
    aws_cognito_identity_provider.google
  ]
}
