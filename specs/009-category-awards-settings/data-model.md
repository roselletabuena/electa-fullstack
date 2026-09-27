# Data Model: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings`
**Status**: Completed

---

## 1. Core Data Entities

### 1.1 Division Data Transfer Object (`DivisionDto`)

Represents an event's competition bracket (e.g., "Miss Universe Teen", "Male Bracket", "Division A").

```typescript
export interface DivisionDto {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  contestantCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### 1.2 Award Category Data Transfer Object (`AwardCategoryDto`)

Represents a specialized award track or voting category (e.g., "People's Choice", "Best Talent", "Best in Evening Gown").

```typescript
export interface AwardCategoryDto {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  isVotingOpen: boolean;
  displayOrder: number;
  contestantCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### 1.3 Event Unified Taxonomy (`EventTaxonomyDto`)

Composite envelope returned by `GET /api/events/[slug]/categories`.

```typescript
export interface EventTaxonomyDto {
  divisions: DivisionDto[];
  awardCategories: AwardCategoryDto[];
}
```

---

## 2. Client-Side Preset Data Model

### 2.1 Taxonomy Preset Definition (`TaxonomyPreset`)

Curated competition templates that organizers can select to prepopulate divisions and award tracks.

```typescript
export interface TaxonomyPreset {
  id: string;
  title: string;
  description: string;
  iconName: "crown" | "music" | "sparkles" | "trophy";
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
}
```

### 2.2 Standard Presets Catalog

1. **Beauty Pageant**:
   - Divisions: `Female Category`, `Male Category`, `LGBTQ+ Category`, `Teen Category`
   - Award Categories: `People's Choice Award` (Voting Open), `Best in Evening Gown` (Voting Closed), `Best in Swimsuit` (Voting Closed), `Miss Congeniality` (Voting Closed), `Photogenic Award` (Voting Open)
2. **Singing / Talent Contest**:
   - Divisions: `Solo Vocalist`, `Duet / Acoustic Group`, `Band / Choir`
   - Award Categories: `Audience Favorite Award` (Voting Open), `Best Vocal Performance` (Voting Closed), `Best Stage Presence` (Voting Closed)
3. **Dance Championship**:
   - Divisions: `Junior Division`, `Varsity Division`, `Open Mega Crew`
   - Award Categories: `People's Choice Crew` (Voting Open), `Best Choreography` (Voting Closed), `Crowd Impact Award` (Voting Open)
4. **Academic / Hackathon**:
   - Divisions: `Track A - Web & Cloud`, `Track B - AI & Data`, `Track C - Social Impact`
   - Award Categories: `Community Choice Project` (Voting Open), `Best Innovation` (Voting Closed), `Best Technical Execution` (Voting Closed)

---

## 3. UI State Models & Validation

### 3.1 Division Creation / Edit Form State

```typescript
export interface DivisionFormValues {
  name: string;
  description?: string;
  displayOrder?: number;
}
```

### 3.2 Award Category Creation / Edit Form State

```typescript
export interface AwardCategoryFormValues {
  name: string;
  description?: string;
  isVotingOpen: boolean;
  displayOrder?: number;
}
```

### 3.3 Deletion Safety State

```typescript
export interface DeletionTarget {
  type: "division" | "awardCategory";
  id: string;
  name: string;
  contestantCount: number;
}
```
