# Quickstart & Verification Guide: Demo Day People's Choice Voting & Stage Leaderboard

**Feature ID**: `046-peoples-choice-voting-stage-leaderboard`  
**Ticket**: [VS-116](https://the-three-devsketeers.atlassian.net/browse/VS-116)  

---

## 1. Running Automated Unit Tests

Run Vitest unit tests covering People's Choice voting service, button, stage leaderboard, and page:

```bash
npx vitest run tests/unit/hackathons/peoples-choice
npx vitest run tests/unit/hackathons/stage
```

Or run all unit tests:

```bash
npm run test:unit
```

---

## 2. Interactive Manual Verification Walkthrough

### Scenario A: Cast People's Choice Vote
1. Navigate to `/events/[hackathon-slug]/projects`.
2. Locate a project card in the exhibition gallery.
3. Verify the `"Vote People's Choice"` button is visible.
4. Click `"Vote People's Choice"`.
5. Observe:
   - Button shifts immediately to active state `"Voted"` with accent background.
   - Accessible toast notification confirms vote recorded.
   - Vote count increments by 1.

### Scenario B: Duplicate Vote Prevention
1. On the same hackathon projects page, locate another project card.
2. Click `"Vote People's Choice"`.
3. Observe:
   - Accessible toast notification: `"You have already cast your People's Choice vote for this hackathon."`.
   - The second project does not register a vote.

### Scenario C: Projector Stage Display
1. Navigate to `/events/[hackathon-slug]/stage`.
2. Observe:
   - Big-screen luxury presentation layout formatted for 16:9 / 4K.
   - Top projects ranked with prominent numbers (#1, #2, #3), vote tallies, percentage bars, and team members.
   - Press `F` key to enter native fullscreen mode.
   - Select track filter pills (e.g. "AI & Agents", "Web3") to filter standings dynamically.
   - Real-time updates poll automatically without full-page reload or jitter.
