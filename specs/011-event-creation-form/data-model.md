# Data Model & State Specifications: Event Creation Form UI

**Feature**: `011-event-creation-form`  
**Date**: 2026-09-27  
**Status**: Ready

---

## 1. Form Values & Types

```typescript
import { z } from "zod";
import { createEventSchema, type CreateEventInput } from "@/lib/validations/event";

export type CreateEventFormValues = CreateEventInput;

export type SlugAvailabilityStatus =
  "idle" | "checking" | "available" | "unavailable" | "reserved" | "invalid";

export interface SlugValidationState {
  status: SlugAvailabilityStatus;
  message?: string;
}
```

---

## 2. Field Rules & Default Values

| Field         | Input Type     | Default Value                  | Validation Rules                                                      |
| :------------ | :------------- | :----------------------------- | :-------------------------------------------------------------------- |
| `title`       | Text Input     | `""`                           | Min 3, Max 120 chars, required                                        |
| `slug`        | Text Input     | `""`                           | Min 3, Max 60 chars, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`, non-reserved |
| `description` | Textarea       | `""`                           | Min 10, Max 5000 chars, required                                      |
| `bannerUrl`   | URL Input      | `""`                           | Valid HTTPS URL string                                                |
| `startsAt`    | Datetime-local | Now + 1 day (UTC ISO string)   | Valid ISO 8601 string                                                 |
| `endsAt`      | Datetime-local | Now + 30 days (UTC ISO string) | Valid ISO 8601 string, must be >= `startsAt` + 1 hour                 |

---

## 3. UI Component Props & State

```typescript
export interface CreateEventFormProps {
  onSuccess?: (slug: string) => void;
  onCancel?: () => void;
  className?: string;
}
```
