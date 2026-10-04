# Feature Specification: AWS S3 Media Storage, CORS & IAM Security Setup

**Feature Branch**: `024-aws-s3-storage-setup`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-41: [BE] 1.1 AWS S3 Bucket, CORS & IAM Security Setup"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Secure Object Storage & Access Control for Media Assets (Priority: P1)

As an Electa platform operator and developer,
I need a dedicated, server-side encrypted AWS S3 bucket provisioned with least-privilege IAM service credentials,
So that contestant avatars, event banners, and public media assets are isolated, safeguarded against unauthorized tampering, and accessible only through scoped storage actions.

**Why this priority**: Object storage foundation and credential security are prerequisite dependencies for all media handling across the entire Electa application.

**Independent Test**: Can be verified by provisioning the bucket and verifying that the dedicated IAM service credentials can put, read, and delete objects within the designated bucket while all unauthorized external operations and access to other AWS resources are denied.

**Acceptance Scenarios**:

1. **Given** the Electa cloud infrastructure in region `ap-southeast-1`, **When** the media storage bucket `electa-dev-media-assets` is provisioned, **Then** all default public ACLs and bucket policies are blocked, and server-side encryption (AES-256) is enforced for all stored objects.
2. **Given** an active media storage bucket, **When** an IAM service user (`electa-s3-service-user`) attempts to perform `PutObject`, `GetObject`, or `DeleteObject` operations, **Then** AWS permits the actions.
3. **Given** the scoped IAM service user (`electa-s3-service-user`), **When** it attempts any action outside the targeted media bucket or administrative actions (such as deleting the bucket or altering IAM policies), **Then** AWS immediately denies the request.

---

### User Story 2 - Cross-Origin Resource Sharing (CORS) for Browser Uploads & Delivery (Priority: P2)

As a frontend voter or organizer uploading contest banners and profile images from authorized web origins,
I need the S3 storage bucket to allow preflight and direct HTTP interactions from authorized Electa domains and local development servers,
So that browsers can securely stream assets to S3 and retrieve image headers (such as ETags) without CORS violations.

**Why this priority**: Without appropriate CORS permissions, web browsers will block direct client interactions and pre-signed uploads, stalling user workflows.

**Independent Test**: Can be verified by sending preflight OPTIONS and upload requests from authorized origins (`http://localhost:3000`, `https://*.electa.app`, `https://*.electa.com`) and verifying that CORS response headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Expose-Headers`) are returned correctly.

**Acceptance Scenarios**:

1. **Given** a web client hosted on an authorized domain (`http://localhost:3000`, `https://*.electa.app`, `https://*.electa.com`), **When** the client issues a `PUT`, `POST`, `GET`, or `HEAD` request to the S3 bucket, **Then** the request succeeds with appropriate CORS headers and exposes the `ETag` header.
2. **Given** a web client hosted on an untrusted third-party domain (e.g., `https://malicious-site.example`), **When** the client sends a cross-origin request to the S3 bucket, **Then** the browser preflight check is rejected with a CORS policy violation.

---

### User Story 3 - Validated Environment Configuration for Platform Integration (Priority: P3)

As a fullstack engineer deploying or configuring Electa services,
I need standardized environment declarations and strict startup validation across both `.env` manifests and application schemas,
So that services fail fast if AWS region, bucket identifier, or authentication domain variables are missing or misconfigured.

**Why this priority**: Clear environment contracts eliminate silent runtime failures and configuration drift across local and deployed environments.

**Independent Test**: Can be verified by running application schema validation against valid and invalid environment configurations, confirming that missing or invalid storage parameters raise explicit configuration errors at build and runtime.

**Acceptance Scenarios**:

1. **Given** an environment configuration defining `AWS_REGION="ap-southeast-1"`, `S3_MEDIA_BUCKET="electa-dev-media-assets"`, and `COGNITO_DOMAIN="https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com"`, **When** the environment schema validation runs, **Then** configuration is accepted and typed values are made accessible to services.
2. **Given** an environment missing `AWS_REGION` or `S3_MEDIA_BUCKET`, **When** the application starts or typechecks, **Then** the validation schema throws a descriptive validation error identifying the missing key.

---

### Edge Cases

- **Bucket Name Collision**: How does the system handle global S3 bucket name uniqueness across AWS accounts? S3 bucket names follow standard naming conventions parameterized with project and environment prefixes.
- **Multiple Environments**: How does the system isolate development assets from production? Separate buckets (e.g. `electa-dev-media-assets` vs `electa-prod-media-assets`) and scoped IAM policies are provisioned per environment tier.
- **Subdomain Origin Matching**: What happens when client requests originate from varied subdomains (e.g. `https://dev.electa.app` or `https://staging.electa.app`)? CORS origin configuration supports wildcard patterns (`https://*.electa.app`, `https://*.electa.com`) alongside `http://localhost:3000`.
- **Credential Rotation**: How are credentials updated without service interruption? Service users utilize distinct access key IDs managed through configuration secrets without altering bucket resource policies.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provision an AWS S3 bucket dedicated to media assets in region `ap-southeast-1` named with the project and environment convention (`electa-dev-media-assets`).
- **FR-002**: System MUST configure server-side encryption on the media bucket using AES-256 by default.
- **FR-003**: System MUST block all public ACLs, public policies, and public bucket modifications at the bucket level.
- **FR-004**: System MUST apply a CORS policy allowing HTTP methods `GET`, `PUT`, `POST`, and `HEAD` from approved origins (`http://localhost:3000`, `https://*.electa.app`, `https://*.electa.com`).
- **FR-005**: System MUST configure CORS to expose the `ETag` header to allow client-side upload verification.
- **FR-006**: System MUST provision a least-privilege IAM service user (`electa-s3-service-user`) with an attached policy restricted strictly to `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` actions scoped to `arn:aws:s3:::electa-dev-media-assets/*`.
- **FR-007**: System MUST declare required environment variable contracts in documentation (`.env.example`) and enforce strict schema validation in the application environment module for `AWS_REGION`, `S3_MEDIA_BUCKET`, and `COGNITO_DOMAIN`.

### Key Entities

- **Media Storage Bucket**: Represents the primary AWS S3 container for public and semi-public platform media (event banners, contestant photos, category badges). Key attributes include bucket name, AWS region, encryption status, and public access block rules.
- **CORS Rule Set**: Defines cross-origin browser permissions including allowed origins, allowed HTTP methods, allowed headers, and exposed response headers.
- **Storage IAM Policy**: Defines the security boundary and permissions granted to platform services, strictly limiting actions to object creation, retrieval, and removal within the bucket resource ARN.
- **Environment Configuration**: Key-value contract establishing runtime connectivity between the application tier and cloud storage infrastructure.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of non-authorized origins attempting cross-origin write requests to the bucket are blocked by CORS preflight verification.
- **SC-002**: 100% of uploaded objects stored in the media bucket have AES-256 server-side encryption enabled automatically at rest.
- **SC-003**: The IAM service policy denies 100% of requests attempting actions outside `PutObject`, `GetObject`, and `DeleteObject`, or targeting resources outside the designated media bucket ARN.
- **SC-004**: 100% of application runtime instances fail immediately during initialization if required storage environment variables are absent, preventing downstream silent failures.
- **SC-005**: Local and staging browser clients can initiate preflight requests and obtain successful CORS responses in under 200ms.

## Assumptions

- AWS account credentials and Terraform remote state backends have appropriate administrative privileges to provision S3 and IAM resources in `ap-southeast-1`.
- The S3 bucket is primarily intended for application media (photos, banners, documents) rather than high-throughput video streaming, which would utilize external video hosting or specialized CDNs.
- Public read access for browser viewing of media assets will be resolved via signed URLs or an integrated CloudFront/CDN distribution rather than unauthenticated public bucket ACLs.
- Environment secrets (AWS access keys) are managed securely via platform environment secrets and never committed to version control.
