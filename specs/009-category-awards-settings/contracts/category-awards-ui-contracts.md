# UI & API Contracts: Organizer Dashboard "Categories & Awards" Settings

**Feature Branch**: `009-category-awards-settings`
**Status**: Completed

---

## 1. REST API Endpoints Consumed by UI

### 1.1 Fetch Taxonomy

- **URL**: `GET /api/events/[slug]/categories`
- **Response**:

```json
{
  "success": true,
  "data": {
    "divisions": [
      {
        "id": "clt_div_1",
        "eventId": "clt_evt_1",
        "name": "Female Category",
        "description": "Standard female contestants bracket",
        "displayOrder": 0,
        "contestantCount": 4,
        "createdAt": "2026-09-27T10:00:00.000Z",
        "updatedAt": "2026-09-27T10:00:00.000Z"
      }
    ],
    "awardCategories": [
      {
        "id": "clt_award_1",
        "eventId": "clt_evt_1",
        "name": "People's Choice",
        "description": "Open public voting award",
        "isVotingOpen": true,
        "displayOrder": 0,
        "contestantCount": 4,
        "createdAt": "2026-09-27T10:00:00.000Z",
        "updatedAt": "2026-09-27T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 1.2 Create Division

- **URL**: `POST /api/events/[slug]/divisions`
- **Request Body**:

```json
{
  "name": "Teen Category",
  "description": "Ages 13-17",
  "displayOrder": 1
}
```

- **Response (201 Created)**:

```json
{
  "success": true,
  "data": {
    "id": "clt_div_2",
    "eventId": "clt_evt_1",
    "name": "Teen Category",
    "description": "Ages 13-17",
    "displayOrder": 1,
    "contestantCount": 0,
    "createdAt": "2026-09-27T10:05:00.000Z",
    "updatedAt": "2026-09-27T10:05:00.000Z"
  }
}
```

---

### 1.3 Update Division

- **URL**: `PATCH /api/events/[slug]/divisions/[divisionId]`
- **Request Body**:

```json
{
  "name": "Teen Division Updated",
  "displayOrder": 2
}
```

---

### 1.4 Delete Division

- **URL**: `DELETE /api/events/[slug]/divisions/[divisionId]`
- **Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "clt_div_2"
  }
}
```

- **Response (409 Conflict - Active Contestants Linked)**:

```json
{
  "success": false,
  "error": "Cannot delete division with registered contestants. Reassign contestants first."
}
```

---

### 1.5 Create Award Category

- **URL**: `POST /api/events/[slug]/award-categories`
- **Request Body**:

```json
{
  "name": "Best in Evening Gown",
  "description": "Judged gala competition",
  "isVotingOpen": false,
  "displayOrder": 1
}
```

---

### 1.6 Update Award Category (Toggle Voting / Edit Name / Order)

- **URL**: `PATCH /api/events/[slug]/award-categories/[categoryId]`
- **Request Body**:

```json
{
  "isVotingOpen": true
}
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "clt_award_1",
    "isVotingOpen": true
  }
}
```

---

### 1.7 Delete Award Category

- **URL**: `DELETE /api/events/[slug]/award-categories/[categoryId]`
- **Response (409 Conflict - Active Contestant Assignments)**:

```json
{
  "success": false,
  "error": "Cannot delete award category with registered contestants. Reassign contestants first."
}
```

---

## 2. Component Props Contracts

### 2.1 `CategoryAwardsSettingsForm`

```typescript
export interface CategoryAwardsSettingsFormProps {
  event: Event;
  className?: string;
}
```

### 2.2 `TaxonomyPresetsCard`

```typescript
export interface TaxonomyPresetsCardProps {
  onApplyPreset: (preset: TaxonomyPreset) => Promise<void>;
  isApplying: boolean;
  disabled?: boolean;
}
```

### 2.3 `DivisionsSection`

```typescript
export interface DivisionsSectionProps {
  slug: string;
  divisions: DivisionDto[];
  isLoading: boolean;
  onAddDivision: (input: CreateDivisionInput) => Promise<void>;
  onUpdateDivision: (divisionId: string, input: UpdateDivisionInput) => Promise<void>;
  onDeleteRequest: (division: DivisionDto) => void;
}
```

### 2.4 `AwardCategoriesSection`

```typescript
export interface AwardCategoriesSectionProps {
  slug: string;
  awardCategories: AwardCategoryDto[];
  isLoading: boolean;
  onAddCategory: (input: CreateAwardCategoryInput) => Promise<void>;
  onToggleVoting: (categoryId: string, isVotingOpen: boolean) => Promise<void>;
  onUpdateCategory: (categoryId: string, input: UpdateAwardCategoryInput) => Promise<void>;
  onDeleteRequest: (category: AwardCategoryDto) => void;
}
```

### 2.5 `TaxonomyDeleteDialog`

```typescript
export interface TaxonomyDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  target: DeletionTarget | null;
  isDeleting: boolean;
}
```
