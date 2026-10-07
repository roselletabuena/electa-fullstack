# Interface Contracts: Draft Preview Access & Security

**Feature**: `028-draft-passphrase-protection`  
**Spec**: [spec.md](../spec.md)  
**Parent Ticket**: [VS-80](https://the-three-devsketeers.atlassian.net/browse/VS-80)

---

## 1. Page Route Contract: `GET /events/[slug]`

### Path

`src/app/(public)/events/[slug]/page.tsx` (React Server Component)

### Headers / Cookies Consumed

- `Cookie`: `vs_preview_[slug]` (Optional signed preview token)
- Session headers via `getSession()`: Authenticated AWS Cognito JWT

### Processing Algorithm

```typescript
if (event.operationalState === "Draft") {
  const session = await getSession();
  const isOwner = Boolean(session && session.userId === event.organizerId);

  if (isOwner) {
    return <EventPageClient initialEvent={event} isDraftPreview accessMode="organizer" />;
  }

  const cookieStore = await cookies();
  const previewCookie = cookieStore.get(`vs_preview_${slug}`)?.value;
  const activeDigest = computePassphraseDigest(event.draftPassphraseHash);

  if (previewCookie && verifyPreviewToken(previewCookie, slug, activeDigest)) {
    return <EventPageClient initialEvent={event} isDraftPreview accessMode="guest" />;
  }

  // If no passphrase is configured on the draft, show private unconfigured view
  if (!event.draftPassphraseHash) {
    return <DraftPrivateNotice eventTitle={event.title} />;
  }

  // Display the passphrase modal for guest access
  return <DraftPassphraseModal eventSlug={slug} eventTitle={event.title} />;
}
```

---

## 2. API Route Contract: `GET /api/events/[slug]`

### Path

`src/app/api/events/[slug]/route.ts`

### Request Parameters

- `slug` (in path, required)

### Authentication

- Session cookie (optional)
- Preview cookie: `vs_preview_[slug]` (optional)

### Responses

#### 200 OK (Public Event or Authorized Draft)

```json
{
  "success": true,
  "data": {
    "id": "evt_draft_01",
    "slug": "preview-draft-contest",
    "title": "Miss Global Philippines 2026 (Internal Preview)",
    "description": "Event description...",
    "bannerUrl": "https://images.unsplash.com/...",
    "startsAt": "2026-10-15T00:00:00.000Z",
    "endsAt": "2026-10-20T00:00:00.000Z",
    "serverTime": "2026-10-08T00:00:00.000Z",
    "operationalState": "Draft",
    "showResultsOnClose": true,
    "organizerId": "usr_organizer_123",
    "contestants": [
      {
        "id": "cst_01",
        "contestantNumber": 1,
        "name": "Maria Angelica Santos",
        "bio": "Advocate for marine conservation...",
        "avatarUrl": "https://images.unsplash.com/...",
        "voteCount": null
      }
    ]
  }
}
```

#### 404 Not Found (Unauthorized Draft or Non-existent Slug)

Returned whenever the event is in `Draft` state and the requester is neither the owner nor presenting a valid preview cookie.

```json
{
  "success": false,
  "error": "Event not found"
}
```

---

## 3. Preview Auth Route Contract: `POST /api/events/[slug]/preview-auth`

### Path

`src/app/api/events/[slug]/preview-auth/route.ts`

### Request Payload

```json
{
  "passphrase": "string (min 4 chars)"
}
```

### Response

#### 200 OK

Sets HTTP-only cookie `vs_preview_[slug]`.

```json
{
  "success": true,
  "data": {
    "previewToken": "eyJzbHVnIjoiLi4uIiw...<signed_token>",
    "expiresAt": "2026-10-09T00:00:00.000Z"
  }
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Invalid draft preview passphrase"
}
```

---

## 4. Preview Token Utility Contract (`preview-token.ts`)

### Functions

```typescript
/**
 * Computes a deterministic short digest of a draft passphrase hash for token binding.
 */
export function computePassphraseDigest(passphraseHash: string | null | undefined): string | null {
  if (!passphraseHash) return null;
  return createHash("sha256").update(passphraseHash).digest("hex").slice(0, 16);
}

/**
 * Creates a signed preview token embedding slug, expiration, and passphrase digest.
 */
export function signPreviewToken(
  slug: string,
  passphraseDigest?: string | null,
  ttlMs = 1000 * 60 * 60 * 24,
): { token: string; expiresAt: string };

/**
 * Verifies preview token integrity, expiration, slug match, and passphrase digest consistency.
 */
export function verifyPreviewToken(
  token: string | null | undefined,
  slug: string,
  expectedDigest?: string | null,
): boolean;
```

---

## 5. UI Contract: Organizer Guidance Banner

### Location

`src/features/events/components/dashboard/ScheduleLifecycleForm.tsx` (beneath the Draft Review Passphrase input group)

### Visual Specification (Electa Opal Theme)

- Container: `border border-sky-200 bg-sky-50/50 p-4 rounded-none dark:border-sky-900/50 dark:bg-sky-950/20`
- Icon: `Info` (`size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5`)
- Typography:
  - Title: `text-xs font-bold text-sky-950 uppercase tracking-wider dark:text-sky-200`
  - Body: `text-xs text-sky-800 leading-relaxed dark:text-sky-300`
- Interactive Action:
  - "Copy Preview URL" button: `variant="outline" size="sm" rounded-none border-sky-300 bg-white text-sky-800 hover:bg-sky-100 hover:text-sky-950 dark:bg-sky-900/50 dark:border-sky-700 dark:text-sky-200`
- Copy feedback: standard toast `Preview link copied to clipboard!`
