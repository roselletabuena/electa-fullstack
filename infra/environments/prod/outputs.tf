output "cognito_user_pool_id" {
  description = "ID of the created AWS Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "Client ID of the User Pool Client"
  value       = module.cognito.user_pool_client_id
}

output "cognito_domain" {
  description = "Cognito Hosted UI Domain prefix"
  value       = "https://${module.cognito.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_issuer_url" {
  description = "Cognito OIDC Issuer URL"
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${module.cognito.user_pool_id}"
}

output "s3_media_bucket" {
  description = "S3 Media Assets Bucket Name"
  value       = module.storage.bucket_name
}

output "env_snippet" {
  description = "Snippet for production deployment environment variables"
  value       = <<-EOT
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=${module.cognito.user_pool_id}
    NEXT_PUBLIC_COGNITO_CLIENT_ID=${module.cognito.user_pool_client_id}
    NEXT_PUBLIC_COGNITO_DOMAIN=https://${module.cognito.domain}.auth.${var.aws_region}.amazoncognito.com
    AUTH_PROVIDER=cognito
    AWS_S3_BUCKET_NAME=${module.storage.bucket_name}
    AWS_REGION=${var.aws_region}
  EOT
}
