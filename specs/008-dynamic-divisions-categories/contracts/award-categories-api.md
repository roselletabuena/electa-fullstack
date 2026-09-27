# API Contract: Award Categories Route Handlers

**Base Path**: `/api/events/[slug]/award-categories` & `/api/events/[slug]/categories`  
**Authentication**: Required for mutations (`POST`, `PATCH`, `DELETE`) via Cognito session; caller must be the event organizer.

---

### 1. List Event Award Categories

- **Route**: `GET /api/events/[slug]/award-categories`
- **Description**: Retrieve all award categories configured for the event, ordered by `displayOrder ASC, name ASC`.
- **Response Format**: `ApiResponse<AwardCategoryDto[]>`
- **HTTP Status**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-01",
      "eventId": "evt-123",
      "name": "People's Choice Award",
      "description": "Determined 100% by public fan voting",
      "isVotingOpen": true,
      "displayOrder": 1,
      "createdAt": "2026-09-27T10:00:00.000Z",
      "updatedAt": "2026-09-27T10:00:00.000Z"
    },
    {
      "id": "cat-02",
      "eventId": "evt-123",
      "name": "Best in Evening Gown",
      "description": "Judged for elegance, poise, and gown craftsmanship",
      "isVotingOpen": false,
      "displayOrder": 2,
      "createdAt": "2026-09-27T10:00:00.000Z",
      "updatedAt": "2026-09-27T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Create Award Category

- **Route**: `POST /api/events/[slug]/award-categories`
- **Description**: Create a new award category for the specified event.
- **Request Body**:
  ```json
  {
    "name": "Darling of the Press",
    "description": "Media choice award",
    "isVotingOpen": true,
    "displayOrder": 3
  }
  ```
- **Responses**:
  - `201 Created`: Award category successfully created.
  - `400 Bad Request`: Payload validation error.
  - `401 / 403 Forbidden`: Unauthorized organizer.
  - `404 Not Found`: Event not found.
  - `409 Conflict`: An award category with this name already exists for this event.

---

### 3. Update Award Category

- **Route**: `PATCH /api/events/[slug]/award-categories/[categoryId]`
- **Description**: Update category title, description, display order, or toggle voting status (`isVotingOpen`).
- **Request Body**:
  ```json
  {
    "isVotingOpen": false,
    "displayOrder": 1
  }
  ```
- **Responses**:
  - `200 OK`: Updated award category object.
  - `400 Bad Request`: Invalid payload.
  - `404 Not Found`: Category or event not found.
  - `409 Conflict`: Name collision on the event.

---

### 4. Delete Award Category

- **Route**: `DELETE /api/events/[slug]/award-categories/[categoryId]`
- **Description**: Delete an award category. Rejects if contestant category assignments exist.
- **Responses**:
  - `200 OK`: `{"success": true, "data": { "id": "cat-01", "deleted": true }}`
  - `400 / 409 Conflict`: Cannot delete category while contestants are assigned.
  - `404 Not Found`: Category not found.
