# Versioning Workflow

Purpose: implement or improve document versioning and snapshot/restore behavior.

Steps:
1. identify relevant versioning code in `backend/src/modules/document/` and frontend version UI components.
2. read `.github/instructions/architecture.md` and any document version docs.
3. avoid changing realtime sync behavior while adding version support.
4. keep version creation and persistence in backend services/repositories.
5. keep frontend version UI separate from live collaboration state.
6. preserve existing editor content and Yjs sync when loading versions.
7. test saving a version, listing versions, and restoring a previous version.
8. validate that editor collaboration still works after a version restore.

Key checks:
- do not bypass service/repository boundaries
- keep version data separate from live Yjs update streams
- preserve permission rules for version actions
