# Collaborative Document Editing System

Skeleton cho do an he thong soan thao van ban cong tac.

## Cong nghe

- Frontend: React, Vite, TipTap, Yjs, Socket.IO Client
- Backend: Node.js, Express, Socket.IO, Sequelize ORM, MySQL
- Realtime sync: Yjs update qua Socket.IO
- Storage: MySQL luu `content_text`, `content_json`, `content_html`, `ydoc_state`

## Cau truc

```text
backend/   Express API, Socket.IO, Sequelize ORM, MySQL services
frontend/  React UI, TipTap editor, socket client
docs/      API, database, websocket events
```

Backend chinh duoc chia theo module/domain trong `backend/src/modules`, vi du `auth`, `user`, `document`.

## Cai dat

```bash
npm install
npm run install:all
```

Tao database MySQL va chay file:

```text
backend/migrations/001_init.sql
```

Copy env mau:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Chay backend va frontend cung luc:

```bash
npm run dev
```

Mac dinh:

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Auth

Backend hien tai dung JWT access token, refresh token va blacklist token khi logout.
