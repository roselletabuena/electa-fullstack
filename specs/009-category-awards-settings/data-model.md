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

## 2. In-Place Edit State & Mutation Models

### 2.1 Update Division Input (`UpdateDivisionInput`)

Payload sent via `PATCH /api/events/[slug]/divisions/[divisionId]`.

```typescript
export interface UpdateDivisionInput {
  name?: string;
  description?: string | null;
  displayOrder?: number;
}
```

### 2.2 Update Award Category Input (`UpdateAwardCategoryInput`)

Payload sent via `PATCH /api/events/[slug]/award-categories/[categoryId]`.

```typescript
export interface UpdateAwardCategoryInput {
  name?: string;
  description?: string | null;
  isVotingOpen?: boolean;
  displayOrder?: number;
}
```

### 2.3 Component Inline Edit State

```typescript
// Active editing state managed within sections:
export type ActiveEditState = {
  editingId: string | null;
  isSaving: boolean;
};
```

_(Note: The client-side `TaxonomyPreset` catalog is retired from this dashboard since taxonomy setup is configured during event creation)._

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
