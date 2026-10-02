# Data Model: Electa Unified Authentication & User Entities

## 1. Entities & Schema Representation

```mermaid
erDiagram
    UserSession {
        string userId PK "usr_... or Cognito sub"
        string email UK "user@domain.com"
        string name "User Full Name"
        string avatarUrl "Profile image URL"
        string role "USER | ORGANIZER | ADMIN"
        datetime expiresAt
    }

    Event {
        string id PK "uuid"
        string slug UK
        string title
        string description
        string bannerUrl
        datetime startsAt
        datetime endsAt
        string publicationStatus "DRAFT | PUBLISHED | ARCHIVED"
        string organizerId FK "references UserSession.userId"
    }

    Vote {
        string id PK "uuid"
        string eventId FK
        string contestantId FK
        string voterId FK "references UserSession.userId"
        string voteType "FREE | BOOST"
        int voteWeight
        datetime createdAt
    }

    UserSession ||--o{ Event : "creates and owns as organizer"
    UserSession ||--o{ Vote : "casts as voter"
    Event ||--o{ Vote : "receives"
```

---

## 2. TypeScript DTO Definitions

```typescript
export type UserRole = "USER" | "ORGANIZER" | "ADMIN";

export interface UserSessionDto {
  userId: string;
  email: string;
  name?: string | undefined;
  role?: UserRole | string | undefined;
  avatarUrl?: string | null | undefined;
  organizationName?: string | null | undefined;
  expiresAt?: string | undefined;
}

export interface LoginCredentialsDto {
  email: string;
  password?: string | undefined;
  isDemoLogin?: boolean | undefined;
  returnTo?: string | undefined;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password?: string | undefined;
  organizationName?: string | undefined;
  returnTo?: string | undefined;
}

export interface AuthResponseDto {
  success: boolean;
  user?: UserSessionDto | undefined;
  redirectTo?: string | undefined;
  error?:
    | {
        code: string;
        message: string;
      }
    | undefined;
}
```

---

## 3. JWT Token Claims (AWS Cognito Aligned)

```json
{
  "sub": "usr_organizer_mock_01",
  "email": "user@electa.ph",
  "name": "Alex Gonzaga",
  "cognito:groups": ["USER"],
  "custom:role": "USER",
  "token_use": "id",
  "iss": "https://cognito-idp.ap-southeast-1.amazonaws.com/localstack_pool",
  "iat": 1790606000,
  "exp": 1791210800
}
```
