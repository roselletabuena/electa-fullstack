# API & Action Contract: Event Creation Service

**Route**: `POST /api/events` (REST Endpoint)  
**Server Action**: `createEventAction(input: CreateEventInput)`  
**Authentication**: Required (AWS Cognito Session via `getSession()`)

---

## 1. REST Endpoint: `POST /api/events`

### Request Headers

- `Content-Type: application/json`
- `Cookie: <auth-session-cookie>`

### Request Body

```json
{
  "title": "Miss Universe Philippines 2026",
  "slug": "muph-2026",
  "description": "Official national voting competition for Miss Universe Philippines 2026.",
  "bannerUrl": "https://assets.electa.app/banners/muph-2026.jpg",
  "startsAt": "2026-10-01T00:00:00.000Z",
  "endsAt": "2026-10-31T23:59:59.000Z"
}
```

### Responses

#### 201 Created — Event Successfully Created

```json
{
  "success": true,
  "data": {
    "id": "c1f72a44-88f2-4e92-9e90-c2084c8cf6df",
    "slug": "muph-2026",
    "title": "Miss Universe Philippines 2026",
    "description": "Official national voting competition for Miss Universe Philippines 2026.",
    "bannerUrl": "https://assets.electa.app/banners/muph-2026.jpg",
    "startsAt": "2026-10-01T00:00:00.000Z",
    "endsAt": "2026-10-31T23:59:59.000Z",
    "publicationStatus": "DRAFT",
    "draftPassphraseHash": null,
    "showResultsOnClose": true,
    "isFreeVotingEnabled": true,
    "dailyFreeVoteLimit": 1,
    "organizerId": "org_user_abc123",
    "createdAt": "2026-09-27T14:20:00.000Z",
    "updatedAt": "2026-09-27T14:20:00.000Z"
  },
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```

#### 400 Bad Request — Validation Failure

```json
{
  "success": false,
  "error": "Event end time must be at least 1 hour after the start time",
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```

#### 401 Unauthorized — Missing / Invalid Session

```json
{
  "success": false,
  "error": "Unauthorized: Organizer session required",
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```

#### 409 Conflict — Duplicate Slug

```json
{
  "success": false,
  "error": "An event with this URL slug already exists",
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```

---

## 2. Server Action: `createEventAction`

```typescript
export async function createEventAction(input: CreateEventInput): Promise<ActionResponse<Event>>;
```

### Return Values

- On success: `{ success: true, data: Event, message: "Event created successfully" }`
- On validation error: `{ success: false, error: "Validation failed", fieldErrors: { endsAt: ["Event end time must be at least 1 hour after the start time"] } }`
- On unauthorized: `{ success: false, error: "Unauthorized" }`
- On collision: `{ success: false, error: "An event with this URL slug already exists", fieldErrors: { slug: ["Slug is already taken"] } }`
