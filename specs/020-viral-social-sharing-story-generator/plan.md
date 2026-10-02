# Implementation Plan: Viral Social Sharing Story Generator

**Feature**: `020-viral-social-sharing-story-generator`  
**Jira Key**: `VS-25`  
**Branch**: `feature/VS-25-viral-social-story-generator`

---

## 1. Architecture & Module Structure

```text
src/
├── features/
│   └── voting/
│       ├── components/
│       │   ├── VoteStoryModal.tsx            # Post-vote celebration & 9:16 story preview dialog
│       │   ├── StoryCardPreview.tsx          # Responsive 9:16 canvas preview renderer
│       │   └── StoryActionButtons.tsx        # 1-Tap Share, Download, and Copy Link buttons
│       ├── utils/
│       │   ├── story-canvas-generator.ts     # Offscreen 1080x1920 2D canvas drawing engine
│       │   └── qr-generator.ts               # Dynamic QR code data URL generation helper
│       └── types/
│           └── story.ts                      # Types, Zod schemas, theme definitions
tests/
└── unit/
    └── voting/
        ├── qr-generator.test.ts              # Unit tests for QR URL encoding
        └── story-canvas-generator.test.ts    # Unit tests for canvas sizing, fallback, and export
```

---

## 2. Integration Points

1. **Vote Confirmation**:
   - `EventContestantGrid.tsx` / `ContestantProfileModal.tsx` trigger the `VoteStoryModal` upon successful vote receipt.
2. **Dynamic Voting URL**:
   - Constructed as `${window.location.origin}/events/${eventSlug}?contestantId=${candidateId}` to route users straight to the ballot for that contestant.
