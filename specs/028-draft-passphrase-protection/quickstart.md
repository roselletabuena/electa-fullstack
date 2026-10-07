# Quickstart Guide: Draft Preview Security & Access Control

**Feature**: `028-draft-passphrase-protection`  
**Spec**: [spec.md](./spec.md)  
**Parent Ticket**: [VS-80](https://the-three-devsketeers.atlassian.net/browse/VS-80)

---

## 1. Prerequisites & Environment Setup

Ensure the development server and test suite dependencies are installed and running:

```bash
# Verify unit test harness
npm run test:unit -- tests/unit/events/draft-auth.test.ts

# Ensure local dev server is operational
npm run dev
```

---

## 2. Validation Scenarios

### Scenario A: Automated Unit Test Suite

Verify that token generation, digest verification, expiration, and tampering prevention function reliably:

```bash
npm run test:unit -- tests/unit/events/
```

**Expected Outcome**: 100% of test suites pass, specifically validating:

- Valid tokens verify successfully with matching digest.
- Tokens are rejected when slug is mismatched.
- Tokens are rejected when signature is altered.
- Tokens are rejected when the passphrase digest changes (rotation).
- Null, empty, and expired tokens are rejected safely.

---

### Scenario B: Owner Bypass vs. Non-Owner Challenge (Browser Test)

1. **Step 1 (Organizer View)**:
   - Log in as the organizer of `preview-draft-contest`.
   - Visit `http://localhost:3000/events/preview-draft-contest`.
   - **Expected**: You immediately see the event preview with the organizer draft banner; no passphrase prompt appears.

2. **Step 2 (Non-Owner / Voter Session)**:
   - Log in as a regular voter or a different user who does _not_ own `preview-draft-contest`.
   - Visit `http://localhost:3000/events/preview-draft-contest`.
   - **Expected**: You are presented with the `DraftPassphraseModal` asking for the review passphrase. The event and contestants are NOT visible.

3. **Step 3 (Incognito / Guest Access)**:
   - Open a private/incognito window (no active session).
   - Visit `http://localhost:3000/events/preview-draft-contest`.
   - **Expected**: You are presented with the `DraftPassphraseModal`.

---

### Scenario C: Public API Route Leakage Prevention (cURL / HTTP Test)

1. **Step 1 (Direct Unauthenticated Request)**:

   ```bash
   curl -i http://localhost:3000/api/events/preview-draft-contest
   ```
   - **Expected Response**:
     ```http
     HTTP/1.1 404 Not Found
     Content-Type: application/json

     {"success":false,"error":"Event not found"}
     ```

2. **Step 2 (Request with Valid Preview Cookie)**:
   - Authenticate with the passphrase via `POST /api/events/preview-draft-contest/preview-auth` to obtain `vs_preview_preview-draft-contest` cookie.
   - Send GET request passing the cookie.
   - **Expected Response**:
     ```http
     HTTP/1.1 200 OK
     Content-Type: application/json

     {"success":true,"data":{"slug":"preview-draft-contest", ...}}
     ```

---

### Scenario D: Instant Token Invalidation on Rotation

1. Unlock preview in an Incognito window with Passphrase "Secret123". Confirm the draft event is visible.
2. In the organizer dashboard (`/events/preview-draft-contest/settings?tab=schedule`), change the passphrase to "Secret456" and click **Save**.
3. Return to the Incognito window and reload `http://localhost:3000/events/preview-draft-contest`.
4. **Expected**: The previous preview cookie is rejected due to digest mismatch; the user is immediately prompted with `DraftPassphraseModal` for the new passphrase.

---

### Scenario E: Organizer Guidance Banner in Settings

1. Navigate to `/events/[slug]/settings?tab=schedule`.
2. Scroll to the **Draft Review Passphrase** card.
3. **Expected**: An informational card is visible stating:
   > "You are logged in as the event organizer, so you will automatically bypass this passphrase prompt when previewing. To test the guest reviewer experience, open the link in an Incognito / Private browsing window."
4. Click the "Copy Preview URL" button and verify the confirmation toast appears.
