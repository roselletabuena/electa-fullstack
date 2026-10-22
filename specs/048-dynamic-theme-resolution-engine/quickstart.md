# Quickstart & Verification Guide: Dynamic Theme Resolution Engine

**Feature ID**: `048-dynamic-theme-resolution-engine`  
**Ticket**: [VS-120](https://the-three-devsketeers.atlassian.net/browse/VS-120)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  

---

## 1. Quick Verification Steps

### Step 1: Run Targeted Unit Tests
Execute the theme resolution and branding validation tests:
```bash
npm run test:unit tests/unit/events/theme-resolution.test.ts
npm run test:unit tests/unit/events/theme-provider.test.tsx
npm run test:unit tests/unit/events/event-branding.test.ts
```

### Step 2: Validate TypeScript Compilation
Run strict type checking:
```bash
npm run typecheck
```

### Step 3: Run Full Quality Gate
Run linter and full unit test suite:
```bash
npm run lint
npm run test:unit
```

---

## 2. Interactive Walkthrough Scenarios

### Scenario A: Testing the Fallback Engine
Call `resolveEventTheme("UNKNOWN_THEME")` in a test or Node shell:
- Verify that a warning is logged: `[ThemeEngine] Unknown or deprecated theme "UNKNOWN_THEME". Falling back to ELECTA_DEFAULT.`
- Verify that the returned object matches `THEME_REGISTRY.ELECTA_DEFAULT`.

### Scenario B: Testing SSR Markup Injection
Render `<EventThemeProvider theme="PAGEANT_EDITORIAL"><div>Content</div></EventThemeProvider>`:
- Verify output contains `<div data-event-theme="pageant-editorial" style="--bg-base: #0B0C10; ...">`.
- Verify no FOUT or layout shift occurs during client hydration.
