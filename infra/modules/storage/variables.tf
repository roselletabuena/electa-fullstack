variable "app_name" {
  type        = string
  description = "Application name prefix for resources"
  default     = "electa"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "enable_versioning" {
  type        = bool
  description = "Enable S3 bucket versioning"
  default     = true
}

variable "cors_allowed_origins" {
  type        = list(string)
  description = "Allowed origins for S3 CORS"
  default     = ["*"]
}
