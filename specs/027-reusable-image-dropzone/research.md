# Technical Research & Design Decisions: Reusable Image Upload & Dropzone Component (VS-45)

**Feature**: [spec.md](spec.md)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  
**Date**: 2026-10-07  
**Status**: Completed  

---

## 1. Architectural Strategy & Direct S3 Upload Transport

### Context & Problem Statement
The dropzone component must transfer binary image files (up to 10MB) directly from the voter/organizer browser to the AWS S3 media bucket (`electa-dev-media-assets` in `ap-southeast-1`), bypassing the Next.js server to avoid saturating Node.js runtime memory and bandwidth. The component must also report continuous, smooth percentage progress (0% to 100%) to the user.

### Options Evaluated

1. **Option A: Native `XMLHttpRequest` with `xhr.upload.onprogress`**
   - *How it works*: A standard `XMLHttpRequest` instance wraps the HTTP `PUT` request with headers matching the presigned URL (`Content-Type`). The `xhr.upload` event listener intercepts `ProgressEvent` events: `(event.loaded / event.total) * 100`.
   - *Pros*: Supported in 100% of browsers; precise byte-level tracking; native `xhr.abort()` cleanly cancels active uploads; fully compatible with AWS S3 presigned PUT URLs which require an exact `Content-Length`.
   - *Cons*: Older callback-based API (easily wrapped in a modern TypeScript `Promise`).

2. **Option B: Modern `fetch()` with simulated progress**
   - *How it works*: Simple `await fetch(uploadUrl, { method: 'PUT', body: file })` with a synthetic interval timer simulating 0% to 90% progress until completion.
   - *Pros*: Clean Promise syntax.
   - *Cons*: Deceptive user experience; fails to reflect actual upload speeds on slow mobile connections or fast venue fiber; violates the requirement for real progress feedback.

3. **Option C: Fetch with `ReadableStream` upload streaming**
   - *How it works*: Streams request body chunks using the experimental Fetch upload streaming API.
   - *Pros*: Modern streaming.
   - *Cons*: Not uniformly supported across mobile Safari/browsers; requires chunked transfer encoding which AWS S3 presigned PUT rejects due to lack of upfront `Content-Length`.

### Decision
**Adopt Option A (Native `XMLHttpRequest` wrapped in a Promise)**.
We implement a lightweight, zero-dependency helper `uploadToS3WithProgress()` inside `src/features/media/utils/s3-upload-client.ts`. It provides an `onProgress(percent: number, loaded: number, total: number)` callback and returns an `abort()` function.

---

## 2. Component Architecture & Vertical Slice Colocation

### Context & Problem Statement
VoteSphere Constitution (§V) mandates modular feature slicing under `src/features/<feature-name>/`. We must decide where the dropzone component, custom hooks, and types reside.

### Decision
Colocate the media upload slice inside `src/features/media/`:
- `src/features/media/components/ImageDropzone.tsx`: Primary interactive dropzone component adhering to brutalist zero-radius styling tokens.
- `src/features/media/hooks/use-image-upload.ts`: Headless state machine managing file selection, client validation, presigning handshake, S3 PUT transfer, and error recovery.
- `src/features/media/utils/s3-upload-client.ts`: Isolated, unit-testable network transport utility.
- `src/features/media/types/index.ts`: TypeScript contracts and Zod schemas for props, states, and payloads.
- `src/features/media/index.ts`: Clean public exports for consumption by `CreateEventForm` (VS-46) and `ContestantFormModal` (VS-46).

---

## 3. Memory Hygiene & Instant Client-Side Previews

### Context & Problem Statement
When a user drops an image, they expect an immediate thumbnail preview while the upload progresses. Creating persistent data URLs (`FileReader.readAsDataURL`) consumes extensive memory for high-resolution 10MB images.

### Decision
- Use `URL.createObjectURL(file)` to generate a fast, native blob URI for the immediate thumbnail.
- Maintain an explicit cleanup effect using `URL.revokeObjectURL(blobUrl)` upon unmounting or when a new file replaces the active selection.
- Once the direct S3 upload completes successfully, swap the local blob preview with the permanent CloudFront/S3 `publicUrl`.

---

## 4. Brutalist Design System & Accessibility (WCAG 2.1 AA)

### Design Tokens & Styling Decisions
Following `.agents/rules/branding-and-design-system.md` and `.agents/rules/accessibility-colors.md`:
- **Geometry**: Strict **0px border radius** (`rounded-none`). No pill shapes or rounded corners.
- **Hairline Borders**: `border-2 border-dashed border-slate-300 dark:border-slate-700`.
- **Drag Hover State**: High contrast sky accent `border-sky-600 bg-sky-500/5 dark:border-sky-400 dark:bg-sky-500/10`.
- **Progress Bar**: Brutalist segmented or solid progress bar with sharp 0px edges (`h-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700` with inner bar `bg-sky-600 dark:bg-sky-500`).
- **Typography**: Outfit heading labels, Sora body text, JetBrains Mono for byte sizes (e.g. `2.4 MB / 5.0 MB`) and percentage integers (`68%`).

### Accessibility (a11y) Architecture
- **Hidden Input**: An accessible `<input type="file" accept="image/jpeg,image/png,image/webp" />` hidden visually with `sr-only` class.
- **Keyboard Triggers**: Container acts as a keyboard button (`role="button"`, `tabIndex={0}`), triggering file picker via `Enter` or `Space`.
- **Focus Rings**: Prominent 2px outline: `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400`.
- **Live Regions**: An `aria-live="polite"` element announces:
  - "Validating image..."
  - "Uploading banner.jpg: 50% completed"
  - "Upload complete. Asset stored successfully."
  - "Upload failed: Network disconnected. Press Retry to resume."
