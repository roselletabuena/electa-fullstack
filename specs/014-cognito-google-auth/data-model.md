# Data Model: AWS Cognito Federated Google Identity Provider & Account Linking

## Entities & Schemas

### 1. Organizer Identity & Profile Representation

```typescript
export interface OrganizerIdentity {
  id: string; // Internal unique organizer ID (e.g. usr_...)
  email: string; // Verified email address
  name: string; // Full display name
  avatarUrl?: string; // Profile image / avatar from Google profile
  cognitoSub: string; // Subject ID from AWS Cognito token
  provider: "COGNITO" | "GOOGLE"; // Primary or federated identity provider
  organizationName?: string; // Optional organization/event team name
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Session Token Payload (`CognitoTokenPayload` Extension)

Extends the verified Cognito ID token payload:

```typescript
export interface CognitoTokenPayload {
  sub: string;
  email: string;
  name: string;
  identities?: Array<{
    userId: string;
    providerName: "Google" | "COGNITO";
    providerType: string;
    issuer: string | null;
    primary: boolean;
    dateCreated: number;
  }>;
  "cognito:groups"?: string[];
  "custom:role"?: string;
  token_use: "id" | "access";
  iss: string;
  iat: number;
  exp: number;
}
```

### 3. Client Session Object (`UserSessionDto`)

```typescript
export interface UserSessionDto {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "ORGANIZER" | "ADMIN" | "VOTER";
  organizationName?: string;
  isNewUser?: boolean;
  expiresAt?: string;
}
```

### 4. OAuth State & Nonce (`OAuthStatePayload`)

Stored in short-lived HTTP-only cookie (`electa_oauth_state`) during OAuth redirection:

```typescript
export interface OAuthStatePayload {
  state: string; // Cryptographic random UUID / hex string
  nonce: string; // Replay-prevention nonce
  returnTo?: string; // Deep link redirect target (default: /dashboard)
  createdAt: number; // Timestamp (valid for 10 minutes)
}
```

## State Transitions & Account Linking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> RedirectToGoogle: Clicks "Continue with Google"
    RedirectToGoogle --> CognitoHostedUI: Redirect to Cognito /oauth2/authorize
    CognitoHostedUI --> CallbackReceived: User Approves & Redirects to /api/auth/callback/cognito
    CognitoHostedUI --> ErrorRedirect: User Cancels / Denies Scope

    CallbackReceived --> TokenExchange: Validate CSRF State & Exchange Code
    TokenExchange --> ErrorRedirect: Invalid Code / Token Timeout

    TokenExchange --> AccountLookup: Decode & Verify ID Token

    AccountLookup --> LinkExistingAccount: Email Matches Existing Organizer
    AccountLookup --> ProvisionNewOrganizer: Email Does Not Exist

    LinkExistingAccount --> SetSessionCookie: Update Profile & Metadata
    ProvisionNewOrganizer --> SetSessionCookie: Create Record with Role ORGANIZER

    SetSessionCookie --> OnboardingSetup: First-time User (New)
    SetSessionCookie --> Dashboard: Returning User / Existing Account

    OnboardingSetup --> Dashboard: Save Org Details or Click "Skip"
    ErrorRedirect --> Unauthenticated: Render Error Toast on /login
```
