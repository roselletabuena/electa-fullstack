# Contract: Cloudflare Turnstile Verification

**Feature**: `015-core-voting-engine`  
**Provider**: Cloudflare Turnstile `siteverify`  
**Endpoint**: `https://challenges.cloudflare.com/turnstile/v0/siteverify`

---

## Siteverify Request (Server-to-Server POST)

Content-Type: `application/x-www-form-urlencoded` or `application/json`

```json
{
  "secret": "<TURNSTILE_SECRET_KEY>",
  "response": "<turnstileToken>",
  "remoteip": "<clientIp>"
}
```

---

## Cloudflare Response

```json
{
  "success": true,
  "challenge_ts": "2026-10-01T00:55:00.000Z",
  "hostname": "electa.ph",
  "error-codes": [],
  "action": "cast_vote",
  "cdata": ""
}
```

If `success === false`, the error codes array may contain:

- `missing-input-secret`: The secret parameter was not passed.
- `invalid-input-secret`: The secret parameter was invalid or did not exist.
- `missing-input-response`: The response parameter was not passed.
- `invalid-input-response`: The response parameter is invalid or has expired.
- `bad-request`: The request was rejected because it was malformed.
- `timeout-or-duplicate`: The response parameter has already been validated before.
