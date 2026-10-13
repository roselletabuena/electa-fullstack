# Data Model & State Architecture: Authenticated User Account Menu

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)  

---

## 1. Domain Entities & Interfaces

The account menu consumes the existing `UserSessionDto` from the authentication feature:

```typescript
export type UserRole = "USER" | "ORGANIZER" | "VOTER" | "ADMIN";

export interface UserSessionDto {
  userId: string;
  email: string;
  name: string;
  role?: UserRole | undefined;
  avatarUrl?: string | null | undefined;
  organizationName?: string | null | undefined;
  isNewUser?: boolean | undefined;
  expiresAt: string;
}
```

---

## 2. Component Props & Internal State

### `UserAccountNavProps`
```typescript
export interface UserAccountNavProps {
  /**
   * Optional user override (primarily for SSR hydration or test harnesses).
   * When omitted, the component consumes `useAuth().user`.
   */
  readonly user?: UserSessionDto | null;
  /**
   * Optional custom logout handler override for testing or custom orchestration.
   */
  readonly onLogout?: () => Promise<void> | void;
  /**
   * Optional additional className for styling trigger container.
   */
  readonly className?: string;
}
```

### Internal State (`useUserAccountMenu` or component state)
- `isOpen: boolean`: Indicates whether dropdown popup is expanded.
- `focusedIndex: number`: For keyboard arrow navigation across menu items (-1 when idle).
- `containerRef: React.RefObject<HTMLDivElement | null>`: Used for outside-click detection.
- `triggerRef: React.RefObject<HTMLButtonElement | null>`: Used to restore focus upon pressing `Escape`.

---

## 3. Avatar Initial Helper

```typescript
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0] ? parts[0].slice(0, 2) : "U").toUpperCase();
  }
  if (email && email.trim().length > 0) {
    return email.trim().charAt(0).toUpperCase();
  }
  return "U";
}
```
