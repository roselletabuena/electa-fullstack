output "user_pool_id" {
  description = "ID of the AWS Cognito User Pool"
  value       = aws_cognito_user_pool.pool.id
}

output "user_pool_arn" {
  description = "ARN of the AWS Cognito User Pool"
  value       = aws_cognito_user_pool.pool.arn
}

output "user_pool_client_id" {
  description = "Client ID of the User Pool Client"
  value       = aws_cognito_user_pool_client.client.id
}

output "domain" {
  description = "Full domain URL for Cognito Hosted UI"
  value       = aws_cognito_user_pool_domain.domain.domain
}
