# Bugfix Workflow

Purpose: fix a defect with minimal impact and preserve existing behavior.

Steps:
1. reproduce the bug and identify the affected area.
2. decide whether the fix is frontend, backend, realtime, or cross-cutting.
3. consult `.github/AGENTS.md`, the relevant agent, and workflow docs.
4. inspect the existing implementation before editing.
5. change only the smallest local area required to fix the issue.
6. avoid broad refactors unless the bug requires it.
7. verify the fix with the same scenario that exposed the bug.
8. if possible, test adjacent behavior to avoid regressions.

Key checks:
- never bypass service layer
- never duplicate existing logic
- preserve socket contract and permission checks
- keep diff size small and readable
