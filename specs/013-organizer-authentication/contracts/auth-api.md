# API Contracts: Organizer Authentication

## Server Actions & Handlers

### 1. `loginAction`

Authenticates credentials and sets the HTTP-only session cookie.

```typescript
// Input
export interface LoginInput {
  email: string;
  password?: string;
  isDemoLogin?: boolean;
  returnTo?: string;
}

// Output
export type LoginResult =
  | { success: true; user: UserSessionDto; redirectTo: string }
  | {
      success: false;
      error: string;
      code: "INVALID_CREDENTIALS" | "USER_NOT_FOUND" | "AUTH_FAILED";
    };
```

---

### 2. `registerOrganizerAction`

Registers a new organizer, provisions the `ORGANIZER` role, and creates an initial session.

```typescript
// Input
export interface RegisterOrganizerInput {
  name: string;
  email: string;
  password?: string;
  organizationName?: string;
}

// Output
export type RegisterResult =
  | { success: true; user: UserSessionDto; redirectTo: string }
  | {
      success: false;
      error: string;
      code: "EMAIL_ALREADY_EXISTS" | "VALIDATION_ERROR" | "REGISTRATION_FAILED";
    };
```

---

### 3. `logoutAction`

Clears authentication cookies and redirects to `/login`.

```typescript
// Output
export type LogoutResult = { success: true };
```
