variable "app_name" {
  type        = string
  description = "Application name prefix for resources"
  default     = "electa"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "db_name" {
  type        = string
  description = "PostgreSQL Database Name"
  default     = "electa"
}

variable "db_username" {
  type        = string
  description = "Master database username"
  default     = "electa_admin"
}

variable "db_password" {
  type        = string
  description = "Master database password"
  sensitive   = true
}

variable "allocated_storage" {
  type        = number
  description = "Allocated storage in GB"
  default     = 20
}

variable "instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t4g.micro"
}
