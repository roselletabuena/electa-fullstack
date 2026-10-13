# Data Model: Archetype-Tailored Event Wizard & Taxonomy UI

**Feature**: `041-archetype-tailored-event-wizard`  
**Ticket**: [VS-84](https://the-three-devsketeers.atlassian.net/browse/VS-84)  
**Date**: 2026-10-13  

---

## 1. Domain Entities & State Models

### Wizard Form State Structure
```typescript
export interface EventWizardFormState {
  // Step 1: General Information
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  startsAt: string; // ISO datetime
  endsAt: string;   // ISO datetime
  isCustomSlug: boolean;

  // Step 2: Archetype & Taxonomy
  archetype: EventArchetype; // 'PAGEANT' | 'STUDENT_COUNCIL' | 'HACKATHON' | 'CUSTOM'
  
  // Archetype-tailored taxonomy drafts:
  positions: Array<{
    name: string;
    description?: string;
    maxSelectionsPerVoter: number;
    minSelectionsPerVoter: number;
    displayOrder: number;
  }>;
  
  divisions: Array<{
    name: string;
    description?: string;
    displayOrder: number;
  }>;

  awardCategories: Array<{
    name: string;
    description?: string;
    isVotingOpen: boolean;
    displayOrder: number;
  }>;

  // Step 3 / Advanced Configuration
  showResultsOnClose: boolean;
  isFreeVotingEnabled: boolean;
  dailyFreeVoteLimit: number;
}
```

---

## 2. Dynamic Archetype Rules & Invariants

1. **`PAGEANT` Archetype**:
   - Primary grouping: `divisions` (e.g. Female, Male, Teen).
   - Secondary grouping: `awardCategories` (e.g. People's Choice, Miss Photogenic).
   - Monetization fields (e.g. take rate, paid votes) are applicable.
2. **`STUDENT_COUNCIL` Archetype**:
   - Primary grouping: `positions` (e.g. President, Vice President, Senators).
   - `maxSelectionsPerVoter` is required and must be `>= 1` and `<= 50`.
   - Monetization and beauty pageant photo criteria are hidden.
   - Presets include standard student government rosters.
3. **`HACKATHON` Archetype**:
   - Primary grouping: `positions` (acting as Tracks/Categories: e.g. "Track A - Web & Cloud", "AI Track").
   - Constraint: Must have at least 1 track/category (`positions.length >= 1`).
   - Terminology: "Tracks" and "Teams / Projects".
4. **`CUSTOM` Archetype**:
   - Allows flexible mix of positions or categories.

---

## 3. Session Draft Persistence Schema

```typescript
export interface EventWizardDraft {
  step: number;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  isCustomSlug: boolean;
  archetype: EventArchetype;
  positions?: Array<{
    name: string;
    description?: string;
    maxSelectionsPerVoter: number;
    minSelectionsPerVoter: number;
  }>;
  updatedAt: number;
}
```
