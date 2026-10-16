# Electa — Architecture Decision Records (ADRs)

This directory maintains the canonical **Architecture Decision Records (ADRs)** for Electa. We follow the [Markdown Any Architecture Decision Records (MADR)](https://adr.github.io/madr/) format to document significant architectural, technical, and design system decisions, their rationales, tradeoffs, and compliance mechanisms.

---

## 📚 Repository Index

| ADR ID                                                               | Title                                                                    |   Status   |    Date    | Technical Area                                     |
| :------------------------------------------------------------------- | :----------------------------------------------------------------------- | :--------: | :--------: | :------------------------------------------------- |
| **[ADR-001](./ADR-001-automated-jira-sync-in-speckit-implement.md)** | Automated Jira Ticket Synchronization & Changelog in Spec-Kit Implement  | `Accepted` | 2026-09-26 | Agile Governance, Spec-Driven Development          |
| **[ADR-002](./ADR-002-strict-zero-radius-brutalist-geometry.md)**    | Strict Zero-Radius Brutalist-Refined Geometry & Design System            | `Accepted` | 2026-10-10 | Frontend Architecture, Design System, Branding     |
| **[ADR-003](./ADR-003-opal-light-mode-default-theme.md)**            | Default Opal Slate-50 Light Mode with Strict Dual-Theme Parity           | `Accepted` | 2026-10-12 | Accessibility (WCAG 2.1 AA), Theme Architecture    |
| **[ADR-004](./ADR-004-aws-amplify-v6-client-isolation.md)**          | AWS Amplify v6 Client-Side Boundary Isolation & Cognito JWT Verification | `Accepted` | 2026-10-14 | Authentication, AWS Cognito, Next.js 16 App Router |

---

## ✍️ How to Author a New ADR

1. Copy the standard template from [`template.md`](./template.md).
2. Name the file using the convention: `ADR-XXXX-<kebab-case-title>.md` (e.g. `ADR-005-redis-voting-cooldown-cache.md`).
3. Complete all sections:
   - **Context & Problem Statement**: The forces, user challenges, and technical debt driving the change.
   - **Decision Drivers**: Key architectural goals and constraints.
   - **Considered Options**: The technical options evaluated with pros and cons.
   - **Decision & Architectural Architecture**: The chosen pattern with Mermaid diagrams and concrete rules.
   - **Consequences**: Explicit positive impacts, negative impacts, and mitigations.
   - **Compliance, Enforcement & Verification**: How the decision is automated and verified in CI / hooks.
4. Add the new record to the table in this `README.md`.
5. Run Graphify incremental sync (`graphify . --update`) to link the decision record into the codebase knowledge graph.
