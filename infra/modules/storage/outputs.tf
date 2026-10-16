output "bucket_name" {
  description = "Name of the S3 media bucket"
  value       = aws_s3_bucket.media.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 media bucket"
  value       = aws_s3_bucket.media.arn
}

output "bucket_domain_name" {
  description = "Regional domain name of the S3 media bucket"
  value       = aws_s3_bucket.media.bucket_regional_domain_name
}

output "iam_user_name" {
  description = "IAM user name for S3 service access"
  value       = aws_iam_user.s3_service_user.name
}

output "iam_user_arn" {
  description = "IAM user ARN for S3 service access"
  value       = aws_iam_user.s3_service_user.arn
}

output "iam_policy_name" {
  description = "IAM policy name for S3 media access"
  value       = aws_iam_policy.s3_media_policy.name
}

output "iam_policy_arn" {
  description = "IAM policy ARN for S3 media access"
  value       = aws_iam_policy.s3_media_policy.arn
}

output "iam_access_key_id" {
  description = "Access key ID for S3 service user"
  value       = aws_iam_access_key.s3_service_key.id
}

output "iam_secret_access_key" {
  description = "Secret access key for S3 service user"
  value       = aws_iam_access_key.s3_service_key.secret
  sensitive   = true
}
