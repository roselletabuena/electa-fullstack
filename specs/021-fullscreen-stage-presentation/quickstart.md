# Quickstart & Verification Guide: Fullscreen Stage Presentation Mode

**Feature ID**: `021-fullscreen-stage-presentation`  
**Jira Key**: `VS-23`

## 1. Local Setup & Quick Launch

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate directly to the stage display for any published event:
   ```
   http://localhost:3000/events/binibining-diliman-2026/stage-display
   ```

---

## 2. Interactive Verification Scenarios

### Scenario A: Fullscreen Big-Screen Experience

1. Load `/events/binibining-diliman-2026/stage-display`.
2. Notice the distraction-free presentation: no header bar, no bottom footer, rich dark obsidian theme.
3. Click "Enter Stage Mode / Fullscreen" or press `F` to toggle browser fullscreen.

### Scenario B: Dramatic Winner Reveal Sequence

1. In the bottom operator dock, click **"Reveal Mode"** (or press `R` to reset).
2. All top podium positions are concealed with glowing suspense cards.
3. Press `Space` or click **"Next Reveal"**:
   - **Step 1**: Reveals 2nd Runner Up with chime effect.
   - **Step 2**: Reveals 1st Runner Up with suspense build.
   - **Step 3**: Reveals the Champion / Winner with fanfare and a burst of gold confetti particles across the canvas.
4. Press `M` to verify sound muting/unmuting.

---

## 3. Automated Test Suite Execution

```bash
npm run test:unit tests/unit/stage-display/
npm run typecheck
npm run lint
```
