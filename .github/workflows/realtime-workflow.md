# Realtime Workflow

Purpose: implement or fix realtime collaboration while respecting Yjs and Socket.IO design.

Steps:
1. identify whether the task affects `backend/src/sockets/document.socket.js`, `frontend/src/hooks/useDocumentSocket.ts`, or editor collaboration modules.
2. read `.github/agents/websocket.agent.md` and Yjs-related skills.
3. confirm the event contract in `frontend/src/socket/socketEvents.ts`.
4. preserve Yjs incremental update behavior; do not send full document state.
5. keep awareness/cursor events separate from content updates.
6. keep permission checks in backend socket handlers.
7. synchronize backend and frontend event names together.
8. validate reconnect, offline, and multi-user scenarios locally.

Key checks:
- use Yjs incremental updates only
- do not send full document through websocket
- maintain room-based `document:{id}` collaboration
- preserve offline sync and reconnect behavior
