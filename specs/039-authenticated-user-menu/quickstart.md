# Quickstart: Authenticated User Account Menu & Dropdown

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)  

---

## 1. Quick Verification

To verify the authenticated user account menu and dropdown components:

```bash
# 1. Run unit tests for navigation & account menu
npm run test:unit tests/unit/navigation/

# 2. Run TypeScript strict typecheck
npm run typecheck

# 3. Run ESLint
npm run lint
```

---

## 2. Using `UserAccountNav`

The component can be rendered in the site header or any layout requiring authenticated user profile access:

```tsx
import { UserAccountNav } from "@/features/navigation";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      {/* Automatically consumes useAuth() */}
      <UserAccountNav />
    </div>
  );
}
```

Or with an explicit mock user for testing/storyboards:

```tsx
<UserAccountNav
  user={{
    userId: "usr_123",
    email: "organizer@electa.ph",
    name: "Maria Santos",
    role: "ORGANIZER",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  }}
/>
```
