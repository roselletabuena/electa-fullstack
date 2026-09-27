# API Contract: Slug Availability Check Endpoint

**Endpoint**: `GET /api/events/check-slug`  
**Authentication**: Public / None required  
**Protocol**: HTTPS / REST

---

## 1. Request

### Query Parameters

| Parameter | Type     | Required | Description                  | Constraints                              |
| :-------- | :------- | :------- | :--------------------------- | :--------------------------------------- |
| `slug`    | `string` | **Yes**  | The candidate slug to verify | 3-60 chars, `^[a-z0-9]+(?:-[a-z0-9]+)*$` |

### Example Request

```http
GET /api/events/check-slug?slug=summer-gala-2026 HTTP/1.1
Host: votesphere.app
Accept: application/json
```

---

## 2. Responses

### 200 OK — Slug Available

```json
{
  "success": true,
  "data": {
    "available": true,
    "slug": "summer-gala-2026"
  },
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```

### 200 OK — Slug Unavailable (Collision or Reserved)

```json
{
  "success": true,
  "data": {
    "available": false,
    "slug": "new"
  },
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```

### 400 Bad Request — Invalid Format

```json
{
  "success": false,
  "error": "Slug must contain only lowercase letters, numbers, and single hyphens",
  "timestamp": "2026-09-27T14:20:00.000Z"
}
```
