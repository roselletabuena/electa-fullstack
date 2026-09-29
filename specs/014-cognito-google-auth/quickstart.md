# Quickstart & Validation Guide: AWS Cognito Federated Google Auth

## Prerequisites

1. Node.js 20+ & npm installed.
2. Terraform CLI installed (for `infra/` provisioning, optional for local simulation).
3. AWS Credentials / AWS SSO profile configured (`rt-dev`).

---

## 1. Local Testing & Verification (Zero External Cloud Dependency)

When running the application with `AUTH_PROVIDER=local` (default in development):

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
2. **Test Google Sign-In Flow**:
   - Navigate to `http://localhost:3000/login`.
   - Click **"Continue with Google"**.
   - In local mode, the flow simulates successful identity exchange and redirects to `http://localhost:3000/onboarding` for new users or `/dashboard` for returning users.
   - Verify `electa_auth_session` cookie is present and contains valid user session data.
3. **Test Account Linking**:
   - Register a user `test-organizer@electa.ph` via email/password.
   - Log out.
   - Click "Continue with Google" with email `test-organizer@electa.ph`.
   - Verify that you are signed into the existing account and redirected directly to `/dashboard`.
4. **Test Cancellation & Error Resilience**:
   - Navigate to `http://localhost:3000/api/auth/callback/cognito?error=access_denied`.
   - Verify redirect to `/login` with error alert displayed.

---

## 2. Infrastructure Deployment with Terraform (`infra/`)

To provision the live AWS Cognito User Pool & Google Identity Provider on AWS:

1. **Navigate to Infrastructure Directory**:
   ```bash
   cd ../infra
   ```
2. **Initialize Terraform**:
   ```bash
   terraform init
   ```
3. **Review & Apply Configuration**:
   ```bash
   terraform plan -var="google_client_id=YOUR_CLIENT_ID" -var="google_client_secret=YOUR_SECRET"
   terraform apply -var="google_client_id=YOUR_CLIENT_ID" -var="google_client_secret=YOUR_SECRET"
   ```
4. **Copy Output Variables into `.env.local`**:
   - Copy `NEXT_PUBLIC_COGNITO_CLIENT_ID` and `NEXT_PUBLIC_COGNITO_DOMAIN` into `vote-sphere/.env.local`.
