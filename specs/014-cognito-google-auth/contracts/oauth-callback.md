# API Contract: OAuth Initiation & Cognito Callback Handlers

## 1. Initiate Google OAuth (`/api/auth/google`)

Initiates the federated sign-in flow by setting the state cookie and redirecting to AWS Cognito.

### Request

- **Method**: `GET`
- **Query Parameters**:
  - `returnTo` (optional, string): Destination after successful authentication (default: `/dashboard`).

### Response

- **Status**: `302 Found`
- **Headers**:
  - `Set-Cookie`: `electa_oauth_state=<state_json>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  - `Location`: `https://<COGNITO_DOMAIN>/oauth2/authorize?identity_provider=Google&client_id=<CLIENT_ID>&response_type=code&redirect_uri=<CALLBACK_URL>&scope=email+openid+profile&state=<STATE>`

---

## 2. Cognito OAuth Callback (`/api/auth/callback/cognito`)

Receives authorization code from Cognito, exchanges for tokens, provisions/links user, and sets session cookie.

### Request

- **Method**: `GET`
- **Query Parameters**:
  - `code` (string): One-time authorization code.
  - `state` (string): CSRF validation state nonce.
  - `error` (optional, string): Error code if user denied or cancelled (e.g., `access_denied`).
  - `error_description` (optional, string): Details on error.

### Error Handling

- If `error` parameter is present: Redirects to `/login?error=auth_cancelled&reason=<sanitized_description>`.
- If `state` does not match `electa_oauth_state` cookie: Redirects to `/login?error=invalid_state`.
- If token exchange fails: Redirects to `/login?error=token_exchange_failed`.

### Success Response

- **Status**: `302 Found`
- **Headers**:
  - `Set-Cookie`: `electa_auth_session=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  - `Set-Cookie`: `electa_oauth_state=; Max-Age=0; Path=/` (Clear state cookie)
  - `Location`: `/onboarding` (for new organizers) OR `/dashboard` (for existing organizers or custom `returnTo`).

---

## 3. Complete Onboarding Action (`completeOnboardingAction`)

Optional server action invoked when an organizer submits the `/onboarding` setup form or clicks skip.

```typescript
export interface CompleteOnboardingInput {
  organizationName?: string;
  skip?: boolean;
}

export type CompleteOnboardingResult =
  { success: true; redirectTo: "/dashboard" } | { success: false; error: string };
```
