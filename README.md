# Electa

> Scalable, secure voting, hackathon evaluations, and event governance platform.

---

## 🏛️ Monorepo Architecture

Electa uses a **Single-Service Monorepo** standard where the full-stack web application and cloud infrastructure-as-code reside side-by-side:

```text
electa/
├── .github/
│   └── workflows/
│       ├── app-ci.yml            # Next.js typecheck, lint, and Vitest unit tests
│       └── infra-ci.yml          # Terraform format & validate matrix
├── infra/                        # Infrastructure as Code (Terraform on AWS)
│   ├── bootstrap/                # S3 remote state bucket + DynamoDB distributed locks
│   ├── modules/                  # Reusable cloud modules (Cognito, RDS Postgres, S3 Storage)
│   └── environments/             # Environment configurations (dev, prod)
├── prisma/                       # Database schema, migrations, and seed scripts
├── public/                       # Static public assets
├── src/                          # Next.js 16 App Router application
│   ├── app/                      # Route handlers and RSC page layouts
│   ├── components/               # UI design system primitives & shared components
│   ├── features/                 # Colocated vertical feature slices
│   └── lib/                      # Core utilities, auth, and database client
├── tests/                        # Vitest unit & integration test suites
├── .env.example                  # Environment variables template
└── package.json                  # Application dependencies and scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: `v22.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL** or **Supabase** database
- **Terraform**: `>= 1.5.0` (for infrastructure workflows)
- **AWS CLI**: configured with appropriate IAM credentials

### 2. Environment Setup

Copy the sample environment variables:

```bash
cp .env.example .env.local
```

Configure your database connection and secrets in `.env.local`.

### 3. Install Dependencies & Generate Database Client

```bash
npm install
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Cloud Infrastructure (`infra/`)

The infrastructure is provisioned with modular Terraform on AWS.

- **Cognito**: User Pool, Hosted UI, and federated Google OAuth.
- **RDS PostgreSQL**: Managed relational database with Aurora options.
- **S3 Storage**: Media storage for contestant assets, avatars, and event media.

### Quickstart for Dev Deployment

```bash
cd infra/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Update credentials in terraform.tfvars
terraform init
terraform plan
terraform apply
```

See [`infra/README.md`](infra/README.md) for full bootstrap and deployment instructions.

---

## 🧪 Quality Gates & Scripts

| Command                    | Description                                                             |
| :------------------------- | :---------------------------------------------------------------------- |
| `npm run dev`              | Starts Next.js development server                                       |
| `npm run build`            | Builds production Next.js bundle                                        |
| `npm run typecheck`        | Validates TypeScript in strict mode (`tsc --noEmit`)                    |
| `npm run lint`             | Runs ESLint across `src/`                                               |
| `npm run test:unit`        | Executes full Vitest unit test suite                                    |
| `npm run test:changed`     | Runs Vitest tests related to touched source files                       |
| `npm run env:check`        | Validates zero raw process.env bypasses (§IV)                           |
| `npm run schema:summary`   | Exports compact `< 500` token Prisma Markdown summary & ERD             |
| `npm run schema:check`     | Verifies schema summary is in sync with `prisma/schema.prisma`          |
| `npm run contracts:export` | Exports machine-readable JSON Schemas to `docs/api-contracts.json`      |
| `npm run agent:verify`     | Unified quality gate: env, constitution, schema, typecheck, lint, tests |
| `npm run format:check`     | Checks formatting with Prettier                                         |

---

## 🤖 CI/CD Workflows

CI pipelines are path-filtered to prevent redundant runs:

- **App CI (`app-ci.yml`)**: Triggers on changes to `src/**`, `prisma/**`, `tests/**`, or build configs. Runs linting, strict typechecking, and the Vitest test suite.
- **Infra CI (`infra-ci.yml`)**: Triggers on changes to `infra/**`. Runs Terraform format checks and headless validation across all environments.
