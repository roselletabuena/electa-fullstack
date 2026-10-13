# Quickstart & Verification Guide: Visual Design System & Brutalist Re-skin of /events/new

**Feature ID**: `037-brutalist-reskin-events-new`  
**Jira Key**: [VS-103](https://the-three-devsketeers.atlassian.net/browse/VS-103)  

---

## 1. Running Unit Tests

Execute the Vitest suite covering the event creation form, page, and slug badges:

```bash
npm run test:unit -- tests/unit/events/create-event-form.test.tsx tests/unit/events/create-event-page.test.tsx
```

---

## 2. Typecheck & Lint Verification

Verify full TypeScript 5 strict mode compliance and lint hygiene:

```bash
npm run typecheck
npm run lint
```

---

## 3. Interactive Browser Walkthrough

1. Start the local development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000/events/new` while signed in as an organizer.
3. Observe the Brutalist aesthetic:
   - Page background: `#F8FAFC` (Light Mode) or `#090D16` (Dark Mode).
   - Form container: Crisp pure white background with a sharp border (`border-slate-300`, `rounded-none`).
   - All input fields, buttons, and badges have **0px border radius** (`rounded-none`).
   - Headings styled in `Outfit` (`font-heading`), body text in `Sora` (`font-sans`), slug input in `JetBrains Mono` (`font-mono`).
4. Type an Event Title (e.g. `"Miss Earth Philippines 2026"`):
   - Observe automatic synchronization to URL Slug (`"miss-earth-philippines-2026"`).
   - Observe the debounced status badge displaying checking state and then available state in zero-radius badge styling.
5. Manually edit the slug:
   - Observe the `"Reset to Title"` button appearing.
   - Click `"Reset to Title"`. The slug reverts to `"miss-earth-philippines-2026"`.
6. Inspect the Action Buttons:
   - Primary button features `.btn-primary` styling (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase`).
   - Touch targets for all interactive buttons meet or exceed `44x44px`.
