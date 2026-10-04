# Implementation Plan: AWS S3 Media Storage, CORS & IAM Security Setup

**Branch**: `024-aws-s3-storage-setup` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/024-aws-s3-storage-setup/spec.md` (Jira: [VS-41](https://the-three-devsketeers.atlassian.net/browse/VS-41))

## Summary

Provision and configure an AWS S3 bucket (`electa-dev-media-assets` in `ap-southeast-1`) with default AES-256 server-side encryption, Block Public Access enabled, and CORS rules allowing `PUT`, `POST`, `GET`, and `HEAD` from `http://localhost:3000`, `https://*.electa.app`, and `https://*.electa.com`. Provision a dedicated IAM service user (`electa-s3-service-user`) with an attached least-privilege policy (`ElectaS3MediaPolicy`) scoped exclusively to `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject`. Update application environment schemas in Next.js (`src/env.ts`), documentation (`.env.example`), and local configuration (`.env.local`) to enforce typed storage configurations.

## Technical Context

**Language/Version**: Terraform >= 1.5.0 (AWS Provider ~> 5.0), TypeScript 5.x (Strict Mode), Node.js 20+

**Primary Dependencies**: HashiCorp AWS Provider (`hashicorp/aws ~> 5.0`), `@t3-oss/env-nextjs`, `zod`

**Storage**: AWS S3 Bucket in region `ap-southeast-1` (`electa-dev-media-assets`)

**Testing**: Vitest (`npm run test:unit`), `terraform validate`, `terraform fmt -check`, TypeScript typecheck (`npm run typecheck`)

**Target Platform**: AWS Cloud Infrastructure (`ap-southeast-1`) & Next.js 16 Web Application

**Project Type**: Multi-repository Infrastructure as Code (`electa-infra`) and Fullstack Application (`electa-fullstack`)

**Performance Goals**: < 200ms CORS preflight response time; 0ms runtime overhead for compiled Zod environment validation

**Constraints**: AES-256 SSE required; Block Public Access enabled; IAM policy restricted strictly to bucket ARN; no raw `process.env` usage

**Scale/Scope**: 1 Terraform storage module, 1 IAM user, 1 IAM policy, 1 dev environment deployment, Next.js environment schema updates and tests

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Compliance Details |
| :--- | :--- | :--- |
| **§I. Strict Type Safety & Boundary Validation** | **PASS** | Environment variables are parsed and validated with Zod schemas (`src/env.ts`) using `@t3-oss/env-nextjs`. No `any` or non-null assertions. |
| **§II. Server-First & Boundary Isolation** | **PASS** | Server-side AWS credentials and keys are isolated to server environment scopes. No leaky client exposure. |
| **§III. Strict State Separation & Single Source of Truth** | **PASS** | Infrastructure state is governed solely by Terraform modules (`electa-infra/modules/storage`); application reads configuration through `@/env`. |
| **§IV. Secure-by-Design & Auth Integrity** | **PASS** | S3 bucket has Block Public Access enabled; least-privilege IAM service user restricted only to `PutObject`, `GetObject`, `DeleteObject`; secrets accessed only via `@/env`. |
| **§V. Feature Colocation & Modular Architecture** | **PASS** | Reusable Terraform module separated cleanly in `modules/storage`; application configuration modularized in `src/env.ts` with dedicated unit test in `tests/unit/`. |
| **§VI. Test-First & Quality Gates** | **PASS** | Schema validation is covered by unit tests in Vitest; Terraform syntax and provider configurations validated with `terraform validate`. |

## Project Structure

### Documentation (this feature)

```text
electa-fullstack/specs/024-aws-s3-storage-setup/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Architecture decisions, S3 & CORS rationale
├── data-model.md        # Terraform entity models, IAM policy JSON, and Zod schemas
├── quickstart.md        # Step-by-step verification commands
├── contracts/
│   └── storage-config-contract.json  # Storage JSON Schema contract
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (Multi-Directory Layout)

```text
# AWS Cloud Infrastructure (electa-infra/)
electa-infra/
├── modules/
│   └── storage/
│       ├── main.tf       # aws_s3_bucket, cors, encryption, public_access_block, iam_user, iam_policy
│       ├── variables.tf  # app_name, environment, cors_allowed_origins
│       └── outputs.tf    # bucket_name, bucket_arn, iam_user_name, iam_policy_arn
└── environments/
    └── dev/
        ├── main.tf       # module.storage instantiation with dev CORS origins
        └── outputs.tf    # S3 and IAM dev outputs

# Fullstack Application (electa-fullstack/)
electa-fullstack/
├── .env.example          # Documented template for S3, AWS, and Cognito env vars
├── .env.local            # Synchronized local development values
├── src/
│   └── env.ts            # Zod validation schema for AWS_REGION, S3_MEDIA_BUCKET, COGNITO_DOMAIN
└── tests/
    └── unit/
        └── env.test.ts   # Vitest unit test confirming storage schema validation
```

**Structure Decision**: Adheres strictly to the multi-directory routing protocol defined in `electa-workspace/AGENTS.md`. Cloud infrastructure provisioning lives in `electa-infra/`, while application environment schemas, documentation, and tests live in `electa-fullstack/`.

## Complexity Tracking

> **Zero Constitution Violations Detected. No complexity exemptions required.**
