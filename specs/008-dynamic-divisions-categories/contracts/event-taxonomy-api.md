# API Contract: Unified Event Taxonomy Route Handler

**Route**: `GET /api/events/[slug]/categories` (Consolidated Taxonomy)  
**Authentication**: Public for published events, or Organizer authenticated session.

---

### 1. Retrieve Event Taxonomy & Categories

- **Description**: Returns both custom divisions and award categories for an event in a single structured response, ordered by `displayOrder ASC`.
- **Response Format**: `ApiResponse<EventTaxonomyDto>`
- **HTTP Status**: `200 OK`

```json
{
  "success": true,
  "data": {
    "divisions": [
      {
        "id": "div-01",
        "eventId": "evt-123",
        "name": "Miss Universe",
        "description": "Female division",
        "displayOrder": 1,
        "createdAt": "2026-09-27T10:00:00.000Z",
        "updatedAt": "2026-09-27T10:00:00.000Z"
      }
    ],
    "awardCategories": [
      {
        "id": "cat-01",
        "eventId": "evt-123",
        "name": "People's Choice Award",
        "description": "Public fan voting",
        "isVotingOpen": true,
        "displayOrder": 1,
        "createdAt": "2026-09-27T10:00:00.000Z",
        "updatedAt": "2026-09-27T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. Error Responses

- `404 Not Found`:
  ```json
  {
    "success": false,
    "error": "Event not found"
  }
  ```
