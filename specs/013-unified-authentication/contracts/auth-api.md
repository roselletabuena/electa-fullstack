# API Contracts: Electa Unified Authentication & Session Management

## Server Actions & Handlers

### 1. `loginAction`

Authenticates credentials (email/password or 1-click demo) and sets the HTTP-only `electa_auth_session` cookie.

```typescript
// Input
export interface LoginInput {
  email: string;
  password?: string | undefined;
  isDemoLogin?: boolean | undefined;
  returnTo?: string | undefined;
}

// Output
export type LoginResult =
  | { success: true; user: UserSessionDto; redirectTo: string }
  | {
      success: false;
      error: {
        code: "INVALID_CREDENTIALS" | "USER_NOT_FOUND" | "AUTH_FAILED" | "VALIDATION_ERROR";
        message: string;
      };
    };
```

---

### 2. `registerAction`

Registers a new user, provisions universal voting and event creation capabilities, and establishes the session cookie.

```typescript
// Input
export interface RegisterInput {
  name: string;
  email: string;
  password?: string | undefined;
  organizationName?: string | undefined;
  returnTo?: string | undefined;
}

// Output
export type RegisterResult =
  | { success: true; user: UserSessionDto; redirectTo: string }
  | {
      success: false;
      error: {
        code: "EMAIL_ALREADY_EXISTS" | "VALIDATION_ERROR" | "REGISTRATION_FAILED";
        message: string;
      };
    };
```

---

### 3. `logoutAction`

Clears the `electa_auth_session` cookie, invalidates server cache, and redirects to `/login`.

```typescript
// Output
export interface LogoutResult {
  success: boolean;
  redirectTo: string;
}
```
