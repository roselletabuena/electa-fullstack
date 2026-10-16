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

output "s3_media_bucket_arn" {
  description = "S3 Media Assets Bucket ARN"
  value       = module.storage.bucket_arn
}

output "s3_iam_user_name" {
  description = "IAM service user name for S3"
  value       = module.storage.iam_user_name
}

output "s3_iam_policy_name" {
  description = "IAM policy name for S3"
  value       = module.storage.iam_policy_name
}

output "s3_iam_policy_arn" {
  description = "IAM policy ARN for S3"
  value       = module.storage.iam_policy_arn
}

output "env_snippet" {
  description = "Snippet to copy into .env.local"
  value       = <<-EOT
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=${module.cognito.user_pool_id}
    NEXT_PUBLIC_COGNITO_CLIENT_ID=${module.cognito.user_pool_client_id}
    NEXT_PUBLIC_COGNITO_DOMAIN=https://${module.cognito.domain}.auth.${var.aws_region}.amazoncognito.com
    AUTH_PROVIDER=cognito
    AWS_REGION=${var.aws_region}
    S3_MEDIA_BUCKET=${module.storage.bucket_name}
    NEXT_PUBLIC_S3_MEDIA_BUCKET=${module.storage.bucket_name}
  EOT
}
