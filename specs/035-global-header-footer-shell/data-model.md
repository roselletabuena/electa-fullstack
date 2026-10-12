# Data Model: Global Header & Footer Shell

No database or Prisma changes. This feature is presentation-only.

## Component Interfaces

| Entity           | Location                                            | Shape                                               |
| :--------------- | :-------------------------------------------------- | :-------------------------------------------------- |
| `SiteShellProps` | `src/features/navigation/components/site-shell.tsx` | `{ children: React.ReactNode; className?: string }` |

## Route Topology

| Route group    | Layout                | Chrome              |
| :------------- | :-------------------- | :------------------ |
| `(public)`     | `SiteShell`           | Header + Footer     |
| `(dashboard)`  | `SiteShell`           | Header + Footer     |
| `(fullscreen)` | none (root only)      | None                |
| `(auth)`       | existing `AuthLayout` | Minimal footer only |

## Invariants

- Exactly one `banner` and one `contentinfo` per page (zero on stage display).
- Footer variant is always `streamlined`.
