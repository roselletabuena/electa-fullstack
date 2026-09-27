# API Contract: Competition Divisions Route Handlers

**Base Path**: `/api/events/[slug]/divisions`  
**Authentication**: Required for mutations (`POST`, `PATCH`, `DELETE`) via Cognito session; caller must be the event organizer.

---

### 1. List Event Divisions

- **Route**: `GET /api/events/[slug]/divisions`
- **Description**: Retrieve all competition divisions configured for the event, ordered by `displayOrder ASC, name ASC`.
- **Response Format**: `ApiResponse<DivisionDto[]>`
- **HTTP Status**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "div-01",
      "eventId": "evt-123",
      "name": "Miss Universe",
      "description": "Female division candidates aged 18-28",
      "displayOrder": 1,
      "createdAt": "2026-09-27T10:00:00.000Z",
      "updatedAt": "2026-09-27T10:00:00.000Z"
    },
    {
      "id": "div-02",
      "eventId": "evt-123",
      "name": "Mister Global",
      "description": "Male division candidates aged 18-30",
      "displayOrder": 2,
      "createdAt": "2026-09-27T10:00:00.000Z",
      "updatedAt": "2026-09-27T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Create Competition Division

- **Route**: `POST /api/events/[slug]/divisions`
- **Description**: Create a new custom division for the specified event.
- **Request Body**:
  ```json
  {
    "name": "Teen Division",
    "description": "Ages 13-17",
    "displayOrder": 3
  }
  ```
- **Responses**:
  - `201 Created`: Division successfully created.
  - `400 Bad Request`: Payload validation error (e.g. empty name, invalid characters).
  - `401 / 403 Forbidden`: Unauthorized organizer.
  - `404 Not Found`: Event with specified slug not found.
  - `409 Conflict`: A division with this name already exists for this event.

---

### 3. Update Competition Division

- **Route**: `PATCH /api/events/[slug]/divisions/[divisionId]`
- **Description**: Modify existing division details.
- **Request Body**:
  ```json
  {
    "name": "Junior Teen Division",
    "displayOrder": 4
  }
  ```
- **Responses**:
  - `200 OK`: Updated division object.
  - `400 Bad Request`: Invalid payload.
  - `404 Not Found`: Division or event not found.
  - `409 Conflict`: Rename collision with another existing division on the event.

---

### 4. Delete Competition Division

- **Route**: `DELETE /api/events/[slug]/divisions/[divisionId]`
- **Description**: Delete a division from the event. Rejects if contestants are actively assigned to it.
- **Responses**:
  - `200 OK`: `{"success": true, "data": { "id": "div-01", "deleted": true }}`
  - `400 / 409 Conflict`: Cannot delete division while contestants are assigned.
  - `404 Not Found`: Division not found.
