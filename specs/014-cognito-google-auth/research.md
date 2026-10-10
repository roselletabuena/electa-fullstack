# Research & Technical Decisions: AWS Cognito Federated Google Identity Provider & Terraform IaC

## 1. AWS Cognito Hosted UI & Google IdP Federation Flow

### Context

Electa needs centralized, secure organizer authentication allowing 1-click Google Sign-In while keeping all identity records governed by AWS Cognito and the Electa database.

### Decision

Implement the standard **OAuth 2.0 Authorization Code Grant with OIDC** using AWS Cognito Hosted UI with Google IdP:

1. **Initiation (`/api/auth/google` or Direct Client Redirect)**:
   - Generates a cryptographically random `state` nonce and stores it in a short-lived HTTP-only cookie (`electa_oauth_state`).
   - Redirects the browser to:
     `https://<cognito-domain>/oauth2/authorize?identity_provider=Google&client_id=<client_id>&response_type=code&redirect_uri=<callback_url>&scope=openid+email+profile&state=<state>`
2. **Callback Handling (`/api/auth/callback/cognito`)**:
   - Validates the returned `state` against `electa_oauth_state` to prevent CSRF.
   - Makes a POST request to `https://<cognito-domain>/oauth2/token` with `grant_type=authorization_code`, `client_id`, `redirect_uri`, and `code`.
   - In local / mock environment, the adapter facilitates local simulation without requiring external cloud connectivity if `AUTH_PROVIDER=local`.
3. **Token Verification & Session Establishment**:
   - Verifies the Cognito `id_token` JWT claims (`sub`, `email`, `name`, `email_verified`).
   - Queries the database for an existing organizer with that `email` or `cognitoSub`.
   - Links the Google identity seamlessly if an email match is found; creates a new organizer record if new.
   - Sets the `electa_auth_session` HTTP-only cookie with the verified user session.
   - Redirects first-time users to `/onboarding` (optional org setup) and returning users to `/dashboard`.

### Alternatives Considered

- _Client-side Google Identity Services (GSI SDK) directly in React_: Rejected because it bypasses AWS Cognito federation, creating fragmented authentication paths and violating the architecture decision for unified AWS Cognito governance.
- _NextAuth / Auth.js library_: Rejected because Electa constitution mandates lightweight, zero-dependency token adapter and direct Next.js 16 App Router Route Handlers / Server Actions.

---

## 2. Terraform Infrastructure as Code Strategy (`infra/`)

### Context

All AWS cloud infrastructure supporting AWS Cognito and Google IdP federation must be reproducible, versioned, and placed in `infra/` (`c:\Users\Roselle Tabuena\workspace\vote-sphere-workspace\infra`).

### Decision

Create a clean, modular Terraform configuration in `infra/`:

- **`main.tf`**: AWS provider configuration with regional variables (defaulting to `ap-southeast-1` or configured region) and backend configuration.
- **`cognito.tf`**:
  - `aws_cognito_user_pool.electa_pool`: User pool with email sign-in alias, auto-verified attributes, standard attributes (email, name), and password policy.
  - `aws_cognito_identity_provider.google`: Configures Google as a social IdP, mapping Google claims (`email`, `name`, `sub`) to Cognito User Pool attributes.
  - `aws_cognito_user_pool_domain.electa_domain`: Provisions Cognito Hosted UI domain prefix.
  - `aws_cognito_user_pool_client.app_client`: Configures App Client with `ALLOWED_OAUTH_FLOWS = ["code"]`, scopes `["email", "openid", "profile"]`, supported IdPs `["COGNITO", "Google"]`, and allowed callback/logout URLs.
- **`variables.tf`**: Input variables for `aws_region`, `environment`, `google_client_id`, `google_client_secret`, and `app_callback_urls`.
- **`outputs.tf`**: Exports `user_pool_id`, `user_pool_client_id`, `cognito_domain`, and `issuer_url` for easy consumption in `.env.local`.

### Alternatives Considered

- _Manual AWS Console clicks_: Rejected because it lacks reproducibility, auditability, and team synchronization.
- _AWS CDK_: Rejected in favor of Terraform which provides cross-cloud compatibility and standard declarative IaC.

---

## 3. Account Linking & Collision Resolution

### Context

An organizer may register with password `organizer@example.com` on Monday and click "Continue with Google" with `organizer@example.com` on Tuesday.

### Decision

1. In the backend callback handler, lookup by `email` is performed against verified email claims from the trusted identity provider token.
2. If an organizer record exists with matching verified email:
   - System updates the user's `cognitoSub` or federated metadata link.
   - Issues `electa_auth_session` cookie for the existing account.
   - Logs the user in directly without requiring manual password re-entry.
3. If no organizer record exists:
   - Provisions new organizer profile.
   - Directs to `/onboarding` for optional workspace/organization setup.

---

## 4. UI/UX Polish for Social Sign-In & Onboarding

### Context

The UI must deliver a premium, seamless visual experience in line with the Electa design system.

### Decision

- **Google Button**: Implements standard Google branding guidelines (official Google icon, neutral high-contrast surface, subtle border, smooth hover elevation).
- **Divider**: Elegant `"or continue with email"` horizontal line divider in both `LoginForm.tsx` and `RegisterForm.tsx`.
- **Onboarding Screen (`/onboarding`)**: Clean, glassmorphic card with organization name input, "Save & Continue" button, and prominent "Skip for now" link.
- **Error Feedback**: Captures `?error=...` query parameters on `/login` and renders a dismissible alert banner describing the exact failure condition (e.g., "Google sign-in was cancelled", "Access was denied", or "Authentication service timeout").
