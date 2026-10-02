# Technical Research & Decision Records: Viral Social Sharing Story Generator

**Feature**: `020-viral-social-sharing-story-generator`  
**Jira Key**: `VS-25`  
**Date**: 2026-10-02

---

## 1. Canvas Rendering Engine vs HTML-to-Image

### Context

We need to generate a crisp 9:16 (1080x1920) social card on client devices (mobile and desktop) that works offline, does not require a headless browser backend (e.g. Puppeteer), avoids DOM layout recalculation lag, and exports high-quality PNGs with zero CORS artifacts.

### Alternatives Evaluated

| Approach                                               | Pros                                                                                                                                    | Cons                                                                                                    | Decision                                     |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| **A. HTML5 Canvas 2D Rendering Engine**                | Fast (<150ms), 1080x1920 native rendering, full control over typography, scrims, and QR codes; zero third-party DOM screenshot baggage. | Requires manual drawing instructions (text wrapping, gradients).                                        | **Selected (Primary)**                       |
| **B. `html-to-image` / `html2canvas`**                 | Uses existing React DOM nodes.                                                                                                          | Fragile with Tailwind v4 `@theme` variables, heavy memory footprint, font flash issues, slow on mobile. | Rejected                                     |
| **C. Server-Side OpenGraph Generation (`@vercel/og`)** | Offloads generation to Edge.                                                                                                            | Requires server roundtrip, latency, doesn't work for immediate 1-tap local downloads.                   | Rejected for instant client story generation |

### Decision

Implement a modular, pure TypeScript canvas story generator (`src/features/voting/utils/story-canvas-generator.ts`) that draws the candidate portrait, high-contrast gradient scrims, typography (Outfit / Sora), scannable QR code (via `qrcode`), and Electa watermark on an offscreen 1080x1920 canvas.

---

## 2. Dynamic QR Code Generation

### Decision

Use `qrcode` library with `QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1, width: 256 })` to generate a high-density QR code pointing directly to the candidate's public voting link (`${origin}/events/${slug}?contestantId=${id}`).

---

## 3. Web Share API & Download Fallback

### Strategy

```typescript
if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
  await navigator.share({
    title: `Vote for ${candidateName} in ${eventTitle}!`,
    text: `I just voted for #${candidateNumber} ${candidateName} in ${eventTitle}! Scan or visit the link to cast your vote!`,
    url: votingUrl,
    files: [file],
  });
} else {
  // Fallback to direct anchor download
  downloadBlob(blob, filename);
}
```
