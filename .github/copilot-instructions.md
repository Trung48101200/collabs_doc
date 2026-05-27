# AI Workspace Instructions

## Project Overview
- Full-stack collaborative editing app with separate `backend/` and `frontend/`
- Backend: Node.js + Express + Socket.IO + Sequelize + MySQL
- Frontend: React + Vite + TypeScript + TipTap + Yjs + Socket.IO client
- Real-time sync is implemented with Yjs updates over Socket.IO in `backend/src/sockets/document.socket.js` and `frontend/src/hooks/useDocumentSocket.ts`

## Architecture
- `backend/src/modules/*` uses modular domain structure: `auth`, `user`, `document`
- API routes are mounted in `backend/src/server.js` under `/api/auth` and `/api/documents`
- Socket logic is registered with `registerDocumentSocket(io)` in `backend/src/sockets/document.socket.js`
- Frontend app state is held in `frontend/src/contexts/SessionContext.tsx`; collaboration state is provided by `frontend/src/editor/CollaborationProvider.tsx`

## Code Style & Conventions
- Backend uses ES modules (`import` / `export`) with top-level `dotenv/config`
- Backend route files export `Router()` instances; services and repositories are separate, e.g. `document.service.js` and `document.repository.js`
- Use `async/await` for DB operations and socket event handlers
- Frontend uses React functional components and hooks exclusively
- Prefer domain-specific hooks in `frontend/src/hooks/` and keep UI rendering in `frontend/src/pages/` and `frontend/src/editor/`
- Keep Yjs / TipTap integration inside editor-related modules: `frontend/src/editor/` and `frontend/src/utils/yjsEncoding.ts`

## Build / Run
- Install dependencies for both packages:
  - `npm run install:all`
- Start development servers together:
  - `npm run dev`
- Backend only:
  - `npm --prefix backend run dev`
- Frontend only:
  - `npm --prefix frontend run dev`
- Production build frontend:
  - `npm --prefix frontend run build`

## Environment and Runtime
- Backend reads `backend/.env.example`; frontend reads `frontend/.env.example`
- Default ports:
  - Backend: `http://localhost:4000`
  - Frontend: `http://localhost:5173`
- Swagger docs are available at `/api-docs`
- Backend health endpoint: `/health`

## Integration Points
- Socket events are defined in `frontend/src/socket/socketEvents.ts`
- Yjs encoding utilities live in `frontend/src/utils/yjsEncoding.ts`
- Document collaboration is orchestrated by `frontend/src/hooks/useDocumentSocket.ts` and `backend/src/sockets/document.socket.js`

## Notes for AI Agents
- Do not add generic patterns unless they match existing modules
- Preserve the current domain separation between auth/user/document in backend
- Prefer modifying existing hook/provider structure rather than introducing new global state for collaboration
- There are no existing automated tests in this repository, so avoid assuming test files or scripts beyond package scripts

## Useful Files
- Backend entry: `backend/src/server.js`
- Backend socket handler: `backend/src/sockets/document.socket.js`
- Frontend root: `frontend/src/app/App.tsx`
- Frontend collaboration provider: `frontend/src/editor/CollaborationProvider.tsx`
- Frontend document socket hook: `frontend/src/hooks/useDocumentSocket.ts`

## Agent docs
- Agent-specific guidance lives in `.github/agents/`
- Use `AGENTS.md` as the index for these files
