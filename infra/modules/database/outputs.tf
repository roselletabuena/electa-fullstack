output "db_endpoint" {
  description = "Connection endpoint for PostgreSQL database"
  value       = aws_db_instance.postgres.endpoint
}

output "db_address" {
  description = "Address for PostgreSQL database"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "Port for PostgreSQL database"
  value       = aws_db_instance.postgres.port
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}
