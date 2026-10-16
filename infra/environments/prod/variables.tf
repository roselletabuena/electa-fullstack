variable "aws_region" {
  type        = string
  description = "AWS region for production deployment"
  default     = "ap-southeast-1"
}

variable "environment" {
  type        = string
  description = "Environment name"
  default     = "prod"
}

variable "app_name" {
  type        = string
  description = "Application name prefix for resources"
  default     = "electa"
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Prefix for AWS Cognito Hosted UI domain"
  default     = "electa-auth-prod"
}

variable "google_client_id" {
  type        = string
  description = "Google OAuth 2.0 Client ID"
  default     = ""
  sensitive   = false
}

variable "google_client_secret" {
  type        = string
  description = "Google OAuth 2.0 Client Secret"
  default     = ""
  sensitive   = true
}

variable "callback_urls" {
  type        = list(string)
  description = "Allowed callback URLs for OAuth 2.0 flow"
  default     = []
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed logout URLs"
  default     = []
}
