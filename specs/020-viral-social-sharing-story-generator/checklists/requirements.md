# Requirements Quality Checklist: Viral Social Sharing Story Generator

**Feature**: `020-viral-social-sharing-story-generator`  
**Jira Key**: `VS-25`

---

## 1. Specification Completeness ("Unit Tests for English")

- [x] **Clear Persona & Motivation**: Voters wanting to campaign for their candidate on Instagram, TikTok, and Facebook.
- [x] **Specific Measurable Outputs**: 1080x1920 PNG image with candidate number, name, photo, event title, category, and dynamic QR code.
- [x] **Defined Error & Fallback Paths**: CORS image fallback to stylized placeholder; Web Share API fallback to direct file download and clipboard link copy.
- [x] **Zero Ambiguity on Export Dimensions**: Native 9:16 aspect ratio (1080x1920).

---

## 2. Electa Branding & Constitutional Compliance

- [x] **Zero-Radius Geometry**: All modal containers, buttons, theme pills, and action controls use `rounded-none` / `--radius: 0px`.
- [x] **Dual-Theme Parity**: High-contrast scrim overlay guarantees text readability regardless of background image colors (WCAG 2.1 AA compliant).
- [x] **Typography**: Outfit heading (`font-heading`), JetBrains Mono (`font-mono`) for candidate numbers, and Sora (`font-sans`) for body/badges.
- [x] **Strict TypeScript & Zod Validation**: All story generator options validated via Zod schemas.
