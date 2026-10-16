# Electa Infrastructure Architecture

Scalable, modular Infrastructure-as-Code (IaC) powered by **Terraform** on **AWS**.

---

## Directory Layout

```text
infra/
├── .gitignore
├── README.md
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
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── terraform.tfvars.example
    └── prod/                        # High-security production environment
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── terraform.tfvars.example
```

---

## Quickstart & Workflows

### 1. (One-Time) Remote State Bootstrap

To ensure your team shares a secure, locked remote state:

```bash
cd infra/bootstrap
terraform init
terraform apply
```

This provisions an encrypted S3 bucket (`electa-tf-state-<region>`) and a DynamoDB lock table (`electa-tf-locks`).

---

### 2. Deploying to Development (`dev`)

1. Change directory to the dev environment:
   ```bash
   cd infra/environments/dev
   ```
2. Copy the sample variables:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
3. Fill in your Google OAuth credentials in `terraform.tfvars`.
4. Initialize & apply:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
5. Copy the generated `env_snippet` from the Terraform output into `.env.local` (at repository root).

---

### 3. Deploying to Production (`prod`)

1. Change directory to prod:
   ```bash
   cd infra/environments/prod
   ```
2. Copy variables and configure production secrets:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
3. Run Terraform:
   ```bash
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

---

## Adding New Resources in the Future

When adding a new AWS service (e.g., Redis caching, ECS Fargate, CloudFront CDN, SES Email):

1. **Create a module**: Add a directory under `infra/modules/<service_name>/` containing `main.tf`, `variables.tf`, and `outputs.tf`.
2. **Expose typed parameters**: Ensure variables have explicit types, sensible defaults for dev, and strict validation for prod.
3. **Instantiate in environments**: Call the module inside `infra/environments/dev/main.tf` and `infra/environments/prod/main.tf` with tier-appropriate configurations.
