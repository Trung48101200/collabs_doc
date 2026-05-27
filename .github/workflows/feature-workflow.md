# Feature Workflow

Purpose: implement a new user-visible capability while preserving the existing architecture.

Steps:
1. determine if the task is frontend, backend, or realtime.
2. choose the matching agent and relevant skill files.
3. read the workflow, then inspect current code in the affected folder.
4. reuse existing components, services, hooks, routes, and socket handlers.
5. keep backend route/controller/service/repository separation.
6. keep frontend state, hook, and editor responsibilities separate.
7. update both sides if the feature touches socket collaboration.
8. validate locally with the running app and manual scenario tests.

Key checks:
- do not rewrite the architecture
- avoid duplicate logic
- keep changes minimal and focused
- preserve API and socket contracts unless change is required
