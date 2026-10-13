---
name: speckit
description: Execute the end-to-end SpecKit lifecycle in an isolated git worktree with automated PR creation (worktree -> specify -> clarify -> checklist -> plan -> tasks -> analyze -> implement -> converge -> auto-PR)
---

# Workflow: speckit

Run the full SpecKit development pipeline for a feature request inside an **isolated git worktree**, culminating in an **automated pull request (auto PR)** targeting `main`.

---

## Workflow Steps

### Step 1: Feature Resolution & Branch Naming
1. If arguments are provided (`$ARGUMENTS`), treat them as the feature title, description, or Jira key.
2. If no arguments are provided, prompt the user for the feature description or pick up active work in `specs/`.
3. Resolve the ticket/slug and format the branch name according to `pr-creator` standards:
   - With Jira key: `feature/<JIRA-KEY>-<kebab-case-slug>` (e.g., `feature/VS-105-realtime-tally-bar`)
   - Without Jira key: `feature/<kebab-case-slug>` (e.g., `feature/realtime-tally-bar`)
4. Set the worktree folder name to `.worktrees/<feature-slug>` (e.g., `.worktrees/VS-105-realtime-tally-bar`).

---

### Step 2: Spawn & Bootstrap Isolated Git Worktree (Always on Latest `origin/main`)
1. **Fetch & Guarantee Latest `main`**:
   - Always fetch the latest remote `main` branch before branching to avoid starting from stale commits:
     ```bash
     git fetch origin main
     ```
2. **Create Worktree from `origin/main`**:
   - Spawn the isolated worktree rooted strictly at the latest `origin/main`:
     ```bash
     git worktree add .worktrees/<feature-slug> -b <branch-name> origin/main
     ```
   - *If the local branch already exists*, ensure it is synchronized with `origin/main`:
     ```bash
     git worktree add .worktrees/<feature-slug> <branch-name>
     cd .worktrees/<feature-slug>
     git fetch origin main
     git rebase origin/main
     ```
3. Fast-bootstrap the worktree dependencies and local environment:
   - **Windows (PowerShell)**:
     ```powershell
     New-Item -ItemType Junction -Path ".worktrees/<feature-slug>/node_modules" -Target "$pwd/node_modules"
     if (Test-Path .env.local) { Copy-Item .env.local ".worktrees/<feature-slug>/.env.local" }
     ```
   - **macOS / Linux**:
     ```bash
     ln -s "$PWD/node_modules" ".worktrees/<feature-slug>/node_modules"
     [ -f .env.local ] && cp .env.local ".worktrees/<feature-slug>/.env.local"
     ```
4. Switch execution context into `.worktrees/<feature-slug>`. All subsequent commands, tests, and file edits occur inside this worktree directory.

---

### Step 3: Execute SpecKit Lifecycle (in Worktree)
Execute the end-to-end SpecKit pipeline via the `speckit-workflow` skill ([SKILL.md](file:///c:/Users/Roselle%20Tabuena/workspace/electa-workspace/electa-fullstack/.agents/skills/speckit-workflow/SKILL.md)) delivering all 8 canonical artifacts:

1. **Bootstrap & Spec**:
   - Run `vote-sphere-feature <feature_name>` or `speckit-specify` to generate `specs/<feature>/spec.md` and `specs/<feature>/research.md`.
2. **Clarify**:
   - Activate `speckit-clarify` to resolve ambiguities, edge cases, and defaults.
3. **Checklist**:
   - Activate `speckit-checklist` to create `specs/<feature>/checklists/requirements.md` ensuring WCAG 2.1 AA and Electa zero-radius branding.
4. **Architecture Planning**:
   - Activate `speckit-plan` to generate `data-model.md`, `contracts/`, `quickstart.md`, and `plan.md`.
5. **Tasks**:
   - Activate `speckit-tasks` to generate dependency-ordered `specs/<feature>/tasks.md`.
6. **Analyze**:
   - Activate `speckit-analyze` to verify consistency across all 8 artifacts before implementation.
7. **Test-Driven Implementation**:
   - Activate `speckit-implement` to execute tasks in `tasks.md` using TDD (Red-Green-Refactor) and atomic Conventional Commits (`feat(...)`, `test(...)`, `fix(...)`).
8. **Convergence & Validation**:
   - Activate `speckit-converge` to verify 100% of tasks are completed.
   - Run verification gates:
     ```bash
     npm run typecheck
     npm run lint
     npm run test:unit
     ```
   - Run `constitution-check` and `graphify-auto-sync`.

---

### Step 4: Automated Pull Request Creation (Auto PR)
Once all tasks pass verification, automatically trigger the `pr-creator` skill ([SKILL.md](file:///c:/Users/Roselle%20Tabuena/workspace/electa-workspace/electa-fullstack/.agents/skills/pr-creator/SKILL.md)) inside the worktree:

1. Ensure the working tree is clean: `git status -s`.
2. Fetch and rebase onto latest `origin/main`:
   ```bash
   git fetch origin main
   git rebase origin/main
   ```
3. Re-run tests to ensure post-rebase stability:
   ```bash
   npm run typecheck
   npm run test:unit
   ```
4. Push branch with upstream tracking:
   ```bash
   git push -u origin HEAD --force-with-lease
   ```
5. Generate the PR description from template into ephemeral `.specify/pr-body.md` with:
   - Jira ticket link and type
   - Executive summary
   - Key architectural changes
   - Vitest & typecheck verification report
   - Electa Constitution checklist (§I–§VI)
6. Open the Pull Request via GitHub CLI:
   ```bash
   gh pr create \
     --base main \
     --head "$(git branch --show-current)" \
     --title "<type>(<scope>): [<JIRA-KEY>] <imperative description>" \
     --body-file ".specify/pr-body.md"
   ```
   *(If `gh` CLI is unauthenticated, output the GitHub compare URL and PR description for 1-click creation)*

---

### Step 5: Completion Summary & Worktree Lifecycle
1. Report the PR link, branch details, test verification, and commit log to the user.
2. Provide worktree cleanup command for once the PR is merged or reviewed:
   ```bash
   git worktree remove .worktrees/<feature-slug> --force
   ```

