# Interface Contract: Organizer Event Branding Settings

**Feature**: `004-organizer-branding-settings` | **Spec**: [spec.md](../spec.md)

---

## 1. Server Action Contract

### Function Signature

```typescript
export async function updateEventBrandingAction(
  slug: string,
  input: UpdateEventBrandingInput,
): Promise<ActionResponse<Event>>;
```

### Request Parameters

- `slug`: `string` — Canonical unique slug identifying the event.
- `input`: `UpdateEventBrandingInput`
  - `title`: `string` (3–100 chars, required)
  - `description`: `string` (max 2000 chars, optional/empty allowed)
  - `bannerUrl`: `string` (HTTPS URL, required)
  - `reason`: `string` (max 500 chars, optional)

### Authorization

- Calls `requireEventOwnership(slug)` server-side.
- Returns `{ success: false, error: "Unauthorized" }` if session is missing or `session.userId !== event.organizerId`.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "evt_123",
    "slug": "miss-visayas-2026",
    "title": "Miss Visayas 2026 Grand Coronation",
    "description": "Updated official competition profile.",
    "bannerUrl": "https://example.com/new-banner.jpg",
    "startsAt": "2026-10-01T00:00:00.000Z",
    "endsAt": "2026-10-02T00:00:00.000Z",
    "publicationStatus": "PUBLISHED",
    "organizerId": "usr_organizer_mock_01",
    "createdAt": "2026-09-27T00:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "message": "Event branding updated successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "fieldErrors": {
    "bannerUrl": ["Banner image URL must use secure HTTPS protocol"]
  }
}
```

---

## 2. Component Contract: `GeneralBrandingForm`

```typescript
export interface GeneralBrandingFormProps {
  event: Event;
}
```

- **Inputs**:
  - `title`: Text input with character counter (`X / 100`)
  - `slug`: Read-only text display with `CopySlugButton`
  - `description`: Textarea with character counter (`X / 2000`)
  - `bannerUrl`: URL input linked dynamically to `BannerAspectPreview`
  - `reason`: Optional text input (`X / 500`)
- **Actions**:
  - "Save Changes" submit button with loading spinner during submission.
  - "Reset" button to revert form to current database values.
