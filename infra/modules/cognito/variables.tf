variable "app_name" {
  type        = string
  description = "Application name prefix for resources"
  default     = "electa"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Prefix for AWS Cognito Hosted UI domain"
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
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed logout URLs for OAuth 2.0 flow"
}

variable "password_minimum_length" {
  type        = number
  description = "Minimum password length for Cognito User Pool"
  default     = 8
}

variable "mfa_configuration" {
  type        = string
  description = "MFA configuration (OFF, ON, OPTIONAL)"
  default     = "OFF"
}
