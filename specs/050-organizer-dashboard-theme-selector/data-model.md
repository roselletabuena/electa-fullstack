# Data Model: Organizer Dashboard Theme Selector

**Feature ID**: `050-organizer-dashboard-theme-selector`  
**Ticket**: [VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)  
**Date**: 2026-10-24

---

## 1. Entities & Schema Structures

### Database Schema (Prisma)

```prisma
enum EventTheme {
  ELECTA_DEFAULT
  PAGEANT_EDITORIAL
}

model Event {
  id                  String                 @id @default(uuid())
  slug                String                 @unique
  title               String
  description         String
  bannerUrl           String
  theme               EventTheme             @default(ELECTA_DEFAULT)
  organizerId         String
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt
  auditLogs           EventAuditLog[]
  // ... other relations
}

model EventAuditLog {
  id          String   @id @default(uuid())
  eventId     String
  action      String   // "UPDATE_BRANDING"
  changedBy   String
  previousVal Json?    // { title, description, bannerUrl, theme }
  newVal      Json?    // { title, description, bannerUrl, theme }
  reason      String?
  createdAt   DateTime @default(now())

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}
```

---

## 2. Form & Action Payload Contracts

### Zod Validation Schema (`src/lib/validations/event-branding.ts`)

```typescript
export const eventThemeSchema = z.enum(["ELECTA_DEFAULT", "PAGEANT_EDITORIAL"]);

export const updateEventBrandingSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().max(2000),
  bannerUrl: z
    .string()
    .trim()
    .url()
    .regex(/^https:\/\/.+/i),
  theme: eventThemeSchema.optional(),
  reason: z.string().trim().max(500).optional(),
});

export type UpdateEventBrandingInput = z.infer<typeof updateEventBrandingSchema>;
```

### Server Action Response Type

```typescript
export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## 3. UI Component Props & State Models

### `ThemeSelectorCardProps`

```typescript
export interface ThemeSelectorCardProps {
  theme: ThemeDefinition;
  isSelected: boolean;
  onSelect: (themeId: EventTheme) => void;
  disabled?: boolean;
}
```

### `ThemeAppearancePreviewProps` (Retired from Dashboard)

> _Note: Retired from `GeneralBrandingForm.tsx` to streamline the branding settings layout._

```typescript
export interface ThemeAppearancePreviewProps {
  theme: ThemeDefinition;
  eventTitle: string;
  bannerUrl?: string;
  className?: string;
}
```
