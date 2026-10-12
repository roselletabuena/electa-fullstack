# Quickstart: Verifying the Global Shell

1. `npm run dev`
2. Visit and confirm header (top, sticky) and footer (bottom):
   - `/`
   - `/events/<slug>`
   - `/events/<slug>/leaderboard`
   - `/dashboard` (signed in)
3. Visit `/events/<slug>/stage-display` and confirm there is **no** header or footer.
4. Toggle light/dark and confirm contrast and sharp corners.
5. Short-content page (e.g. 404 for an event): footer remains at the bottom of the viewport.
6. Run:
   ```bash
   npm run typecheck
   npm run lint
   npm run test:unit
   ```
