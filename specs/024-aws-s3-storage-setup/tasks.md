# Tasks: AWS S3 Media Storage, CORS & IAM Security Setup

**Feature**: `024-aws-s3-storage-setup` (Jira: [VS-41](https://the-three-devsketeers.atlassian.net/browse/VS-41))
**Branch**: `024-aws-s3-storage-setup`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

---

## Phase 1: Setup (Shared Infrastructure & Workspaces)

**Purpose**: Verify multi-repo workspace structure and prerequisite tooling across `electa-infra` and `electa-fullstack`.

- [X] T001 Initialize Terraform dev workspace backend and provider plugins in electa-infra/environments/dev/
- [X] T002 [P] Verify fullstack TypeScript and Vitest execution in electa-fullstack/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core storage variables and baseline module declarations required across all storage features.

- [X] T003 Define storage variables and default parameters in electa-infra/modules/storage/variables.tf
- [X] T004 [P] Establish base S3 media bucket and server-side encryption in electa-infra/modules/storage/main.tf
- [X] T005 [P] Enforce strict S3 Block Public Access controls in electa-infra/modules/storage/main.tf

**Checkpoint**: Core S3 bucket and encryption primitives established. User stories can proceed.

---

## Phase 3: User Story 1 - Secure Object Storage & Access Control (Priority: P1) 🎯 MVP

**Goal**: Provision dedicated S3 bucket (`electa-dev-media-assets`) with least-privilege IAM service user (`electa-s3-service-user`) and scoped IAM policy (`ElectaS3MediaPolicy`).

**Independent Test**: Verify via `terraform validate` and `terraform plan` that the IAM user and policy are generated with actions restricted strictly to `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` targeting `arn:aws:s3:::electa-dev-media-assets/*`.

### Implementation for User Story 1

- [X] T006 [US1] Define IAM policy `ElectaS3MediaPolicy` with scoped PutObject, GetObject, and DeleteObject permissions in electa-infra/modules/storage/main.tf
- [X] T007 [US1] Provision IAM service user `${var.app_name}-s3-service-user` and attach `ElectaS3MediaPolicy` in electa-infra/modules/storage/main.tf
- [X] T008 [P] [US1] Export IAM user name, IAM user ARN, and policy ARN in electa-infra/modules/storage/outputs.tf
- [X] T009 [US1] Wire storage module outputs into dev environment in electa-infra/environments/dev/outputs.tf

**Checkpoint**: User Story 1 complete. Storage infrastructure and IAM security boundary provisioned and verified in Terraform.

---

## Phase 4: User Story 2 - Cross-Origin Resource Sharing (CORS) for Browser Uploads (Priority: P2)

**Goal**: Apply CORS rules to S3 media bucket permitting `GET`, `PUT`, `POST`, and `HEAD` from authorized origins (`http://localhost:3000`, `https://*.electa.app`, `https://*.electa.com`) with exposed `ETag` headers.

**Independent Test**: Verify via `terraform plan` that `aws_s3_bucket_cors_configuration` contains all required origins, methods, and exposed headers matching the interface contract in `contracts/storage-config-contract.json`.

### Implementation for User Story 2

- [X] T010 [US2] Configure `aws_s3_bucket_cors_configuration` resource with allowed methods, headers, and ETag exposition in electa-infra/modules/storage/main.tf
- [X] T011 [US2] Update dev environment instantiation with approved CORS origins (`http://localhost:3000`, `https://*.electa.app`, `https://*.electa.com`) in electa-infra/environments/dev/main.tf

**Checkpoint**: User Story 2 complete. Browser CORS permissions configured and validated against contract schema.

---

## Phase 5: User Story 3 - Validated Environment Configuration for Platform Integration (Priority: P3)

**Goal**: Update Next.js application environment schema (`src/env.ts`), documentation (`.env.example`), and local environment (`.env.local`) to enforce typed S3 and Cognito configuration contracts.

**Independent Test**: Run `npm run test:unit tests/unit/env.test.ts` and `npm run typecheck` to confirm valid configurations pass and missing required storage parameters throw Zod validation errors.

### Tests for User Story 3

- [X] T012 [P] [US3] Create unit tests validating S3 storage and AWS region environment variable parsing in electa-fullstack/tests/unit/env.test.ts

### Implementation for User Story 3

- [X] T013 [US3] Update Zod environment schema in electa-fullstack/src/env.ts to enforce `AWS_REGION`, `S3_MEDIA_BUCKET`, `NEXT_PUBLIC_S3_MEDIA_BUCKET`, and `COGNITO_DOMAIN`
- [X] T014 [P] [US3] Create comprehensive environment template with documented storage variables in electa-fullstack/.env.example
- [X] T015 [P] [US3] Synchronize local environment settings with active dev storage values in electa-fullstack/.env.local

**Checkpoint**: User Story 3 complete. Fullstack application environment strongly typed, validated, and documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code quality validation, formatting, and end-to-end verification across both repositories.

- [X] T016 [P] Run Terraform formatting check and syntax validation (`terraform fmt -check`, `terraform validate`) in electa-infra/
- [X] T017 [P] Run fullstack linting, typechecking, and unit tests (`npm run lint`, `npm run typecheck`, `npm run test:unit`) in electa-fullstack/
- [X] T018 Execute verification checks per quickstart guide in electa-fullstack/specs/024-aws-s3-storage-setup/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Independent — runs first.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — blocks all user stories.
- **User Story 1 (Phase 3 - MVP)**: Depends on Foundational (Phase 2) — provisions core IAM and storage.
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — configures CORS rules on the S3 bucket. Can proceed in parallel with US1.
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) — configures application environment contracts. Can proceed in parallel with US1 and US2.
- **Polish (Phase 6)**: Depends on completion of all user stories (Phases 3, 4, and 5).

### Parallel Opportunities

- `T001` and `T002` can execute in parallel across `electa-infra` and `electa-fullstack`.
- In Phase 2: `T004` (S3 bucket) and `T005` (Block Public Access) can be developed together.
- Once Phase 2 is complete, User Story 1 (Terraform IAM), User Story 2 (Terraform CORS), and User Story 3 (Next.js env schema) can be developed in parallel workstreams.
- In Phase 5: `T012` (Unit test) can run before or concurrently with `T014` and `T015` (.env documentation).
- In Phase 6: `T016` (Terraform validation) and `T017` (Fullstack test suite) run in parallel across the two repositories.

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete Setup and Foundational Terraform definitions.
2. Implement and verify User Story 1 (`ElectaS3MediaPolicy` and `electa-s3-service-user`).
3. Verify that the Terraform plan builds a secure, private S3 bucket with least-privilege credentials.

### Incremental Delivery (Phases 4, 5, and 6)
4. Add User Story 2 CORS configuration for local and preview domains.
5. Add User Story 3 Next.js environment schema validation and unit tests.
6. Run full test suites and formatting checks across both repositories.
