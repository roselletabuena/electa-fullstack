# Quickstart & Verification Guide: AWS S3 Media Storage Setup

**Feature**: `024-aws-s3-storage-setup` (Jira: [VS-41](https://the-three-devsketeers.atlassian.net/browse/VS-41))
**Date**: 2026-10-04

---

## Prerequisites

1. **AWS CLI** configured with administrator credentials or role for region `ap-southeast-1`.
2. **Terraform CLI** (>= 1.5.0).
3. **Node.js 20+ & npm** for application verification.

---

## Step 1: Infrastructure Verification (Terraform)

### 1.1 Validate Terraform Storage Module
Navigate to the Terraform dev environment:

```bash
cd c:\Users\russel\workspace\electa-workspace\electa-infra\environments\dev
terraform init
terraform validate
```

### 1.2 Inspect Planned Resources
Run Terraform plan to verify that the bucket, CORS configuration, and IAM user/policy are generated:

```bash
terraform plan
```

**Expected Plan Resources**:
- `aws_s3_bucket.media` (`electa-dev-media-assets`)
- `aws_s3_bucket_server_side_encryption_configuration.media`
- `aws_s3_bucket_public_access_block.media`
- `aws_s3_bucket_cors_configuration.media`
- `aws_iam_user.s3_service_user` (`electa-s3-service-user`)
- `aws_iam_policy.s3_media_policy` (`ElectaS3MediaPolicy`)
- `aws_iam_user_policy_attachment.s3_media_attach`

---

## Step 2: Application Configuration Verification (Next.js)

### 2.1 Verify Environment Variable Schema
Run strict TypeScript typechecking and unit tests to ensure that `src/env.ts` parses the S3 and Cognito parameters without failure:

```bash
cd c:\Users\russel\workspace\electa-workspace\electa-fullstack
npm run typecheck
npm run test:unit
```

### 2.2 Verify Environment Example Documentation
Verify that `.env.example` documents:
- `AWS_REGION="ap-southeast-1"`
- `S3_MEDIA_BUCKET="electa-dev-media-assets"`
- `COGNITO_DOMAIN="https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com"`

---

## Step 3: End-to-End CORS & IAM Verification (Post-Provisioning)

### 3.1 Test CORS Preflight Request
Execute an HTTP preflight request simulating browser upload from local dev:

```bash
curl -I -X OPTIONS "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

**Expected Result**:
- `HTTP/1.1 200 OK`
- `Access-Control-Allow-Origin: http://localhost:3000`
- `Access-Control-Allow-Methods: GET, PUT, POST, HEAD`
- `Access-Control-Expose-Headers: ETag`

### 3.2 Test CORS Denial for Untrusted Origin
Execute an HTTP preflight request from an unauthorized domain:

```bash
curl -I -X OPTIONS "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com" \
  -H "Origin: https://unauthorized-domain.com" \
  -H "Access-Control-Request-Method: PUT"
```

**Expected Result**:
- No `Access-Control-Allow-Origin` header returned, or HTTP 403 Forbidden.
