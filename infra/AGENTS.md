# Electa Infrastructure — Agent Conventions

Scalable, modular Infrastructure-as-Code (IaC) powered by **Terraform** on **AWS**.

---

## 1. Tech Stack & Tools

| Component           | Specification                                                        |
| :------------------ | :------------------------------------------------------------------- |
| **IaC Engine**      | Terraform `>= 1.5.0`                                                 |
| **Cloud Provider**  | AWS Provider `>= 5.0`                                                |
| **Backend State**   | S3 bucket (`electa-tf-state-<region>`) with SSE-S3 encryption        |
| **State Locking**   | DynamoDB table (`electa-tf-locks`) with `LockID` hash key            |
| **Identity & Auth** | AWS Cognito User Pool, User Pool Client, Hosted UI, Google OAuth IdP |
| **Object Storage**  | AWS S3 with AES256 SSE, Block Public Access, CORS configuration      |
| **Database**        | Amazon RDS PostgreSQL (Multi-AZ in prod)                             |

---

## 2. Directory Layout

```text
infra/
├── .gitignore
├── README.md
├── AGENTS.md                        # This agent guide
│
├── bootstrap/                       # 1-time setup: S3 Remote State Bucket + DynamoDB Locks
│   └── main.tf
│
├── modules/                         # Reusable, composable service modules
│   ├── cognito/                     # AWS Cognito User Pool, Hosted UI, Google OAuth IdP
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/                     # S3 Media Storage (uploads, avatars, assets)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/                    # RDS PostgreSQL (Aurora / Managed DB)
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── environments/                    # Isolated state per deployment tier
    ├── dev/                         # Development & local testing environment
    │   ├── main.tf                  # Module invocations for dev
    │   ├── variables.tf             # Input variables
    │   ├── outputs.tf               # Exports & env_snippet for web app
    │   └── terraform.tfvars.example # Example variable values
    └── prod/                        # High-security production environment
        ├── main.tf                  # Module invocations for prod
        ├── variables.tf             # Strict production variables
        ├── outputs.tf               # Production outputs
        └── terraform.tfvars.example # Production secret placeholders
```

---

## 3. Terraform Authoring Conventions

### Code Style & Formatting

- **Always run `terraform fmt -recursive`** before submitting changes.
- Use **2 spaces** for indentation.
- Attribute assignments should be aligned with equals signs when grouping related arguments.
- Always use canonical resource attribute names and block structures.

### Module Architecture

1. **Separation of Concerns**:
   - `main.tf`: Resources and data sources only.
   - `variables.tf`: Explicit type declarations, descriptive `description` strings, and sensible defaults (for optional attributes).
   - `outputs.tf`: Meaningful exported values with `description` and `sensitive = true` when exposing credentials or secrets.
2. **Standard Resource Tags**:
   All provisioned resources must include standard tagging:
   ```hcl
   tags = {
     Project     = "Electa"
     Environment = var.environment
     ManagedBy   = "Terraform"
   }
   ```
3. **No Hardcoded Secrets or IDs**:
   - Never commit `.tfvars` containing real secrets or API keys.
   - Always provide a `terraform.tfvars.example` template with dummy/placeholder values.
   - Secrets should be passed via environment variables (`TF_VAR_<name>`) or AWS Secrets Manager / SSM Parameter Store.

### Security Baselines

- **S3 Buckets (`modules/storage`)**:
  - `aws_s3_bucket_public_access_block` must have all 4 flags set to `true` (block public ACLs, block public policy, ignore public ACLs, restrict public buckets).
  - Server-side encryption enabled by default (`AES256` or `aws:kms`).
  - Strict CORS rules specifying explicitly allowed origins (no wildcard `*` allowed origins in production).
- **RDS Database (`modules/database`)**:
  - Placed in private DB subnet groups, never publicly accessible.
  - Storage encryption enabled with KMS or default AWS key.
- **Cognito (`modules/cognito`)**:
  - Secure password policies (minimum 8 characters, symbols, numbers, mixed case).
  - Callback and logout URLs strictly constrained to authorized web domains.

---

## 4. Connecting Infrastructure to Web Application

When creating or modifying infrastructure resources needed by the web application:

1. **Expose values in `environments/<env>/outputs.tf`**:
   - Output structured resource identifiers (e.g. `s3_media_bucket_name`, `s3_media_bucket_region`, `cognito_user_pool_id`, `cognito_client_id`).
   - Maintain the `env_snippet` output in `environments/dev/outputs.tf` so developers can copy values directly into `.env.local` at the repository root.
2. **Notify fullstack schema**:
   - Ensure corresponding environment variables are defined in `src/env.ts` and `.env.example`.

---

## 5. Quality & Verification Commands

Always run these commands from the target environment directory (`environments/dev` or `environments/prod`):

```bash
# Format check
terraform fmt -check -recursive

# Validate syntax and module signatures
terraform validate

# Review execution plan
terraform plan
```

---

## 6. Monorepo Integration & CI Gates

- `infra/` is a first-class directory within the Electa Single-Service Monorepo.
- Path-filtered CI (`.github/workflows/infra-ci.yml`) automatically runs Terraform format checks and validation across all environments whenever files under `infra/**` are modified.
- Commits must follow **Conventional Commits** (e.g. `feat(infra/storage): ...`, `fix(infra/cognito): ...`, `chore(infra/bootstrap): ...`).
- Never commit `.terraform/`, `*.tfstate`, `*.tfstate.backup`, or `*.tfvars` files.
