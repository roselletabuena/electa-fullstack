# SonarLint & Clean Code Autonomous Enforcement Rule

Whenever code is written, modified, reviewed, or prepared for commit in this repository:

## 1. Zero-Tolerance for SonarLint / SonarJS Violations
- The agent **MUST proactively run or check SonarLint / ESLint diagnostics** on all newly created or touched files before staging or committing.
- If any SonarLint issues (errors or warnings) are detected, the agent **MUST autonomously refactor and fix them immediately** without waiting for user instruction.

## 2. Mandatory Remediation Patterns

1. **`sonarjs/parameterized-tests`**:
   - Refactor repetitive unit tests into a single parameterized test using `it.each([...])`.
2. **`sonarjs/cognitive-complexity`**:
   - Decompose functions exceeding complexity thresholds into small, focused, single-responsibility helper functions.
3. **`sonarjs/no-nested-conditional`**:
   - Replace nested ternary operators with clear guard clauses, `if/else` statements, or dictionary/map lookups.
4. **`sonarjs/no-redundant-optional`**:
   - Avoid redundant `| undefined` on optional properties unless strictly needed for `exactOptionalPropertyTypes`.
5. **`sonarjs/pseudo-random`**:
   - Use `crypto.getRandomValues()` or cryptographically secure alternatives when generating IDs, tokens, or security hashes.
6. **`sonarjs/no-nested-template-literals`**:
   - Extract inner template strings into explicit local variables or concatenation helpers.

## 3. Pre-Commit Verification Gate
- Run `npx eslint <touched_files>` to verify 0 Sonar errors before executing `git commit`.
