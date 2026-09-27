# Quickstart & Validation Guide: Organizer Event Branding

**Feature**: `004-organizer-branding-settings` | **Spec**: [spec.md](../spec.md)

---

## 1. Automated Test Execution

Run the targeted Vitest test suites for validation and server actions:

```bash
# Run unit tests for branding schemas and mutation action
npm test tests/unit/events/branding-validation.test.ts
npm test tests/unit/events/update-branding-action.test.ts
```

---

## 2. Local Manual Validation Flow

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Authenticate as Event Organizer**:
   - Navigate to `http://localhost:3000/login`.
   - Click **"Authorized Organizer (Owner)"** (authenticates as `usr_organizer_mock_01`).

3. **Navigate to Event Settings**:
   - Visit `http://localhost:3000/events/miss-visayas-2026/settings?tab=general`.

4. **Verify Interactive Branding Form**:
   - Confirm the **General** tab displays editable inputs for Title, Description, and Banner URL.
   - Confirm the Event Slug is read-only.
   - Click the **"Copy Public Link"** button $\rightarrow$ confirm toast/checkmark feedback and that clipboard contains the canonical event URL.

5. **Verify Live Aspect Ratio Preview**:
   - Paste a new valid image URL into the **Banner URL** field (e.g. `https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80`).
   - Toggle between **16:9** and **21:9** preview modes $\rightarrow$ observe smooth aspect ratio transition without page reloads.

6. **Submit & Verify Persistence**:
   - Update the Title to `"Miss Visayas 2026 Coronation Night"`.
   - Enter an optional reason: `"Updated official sponsor banner and title"`.
   - Click **"Save Changes"** $\rightarrow$ verify success toast appears, header title updates, and values persist on browser refresh.
