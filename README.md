# Collaborative Document Editing System

Skeleton cho do an he thong soan thao van ban cong tac.

## Cong nghe

- Frontend: React, Vite, TipTap, Yjs, Socket.IO Client
- Backend: Node.js, Express, Socket.IO, MySQL
- Realtime sync: Yjs update qua Socket.IO
- Storage: MySQL luu `content_text`, `content_json`, `content_html`, `ydoc_state`

## Cau truc

```text
backend/   Express API, Socket.IO, MySQL services
frontend/  React UI, TipTap editor, socket client
docs/      API, database, websocket events
```

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

## Tai khoan demo

Skeleton hien tai dung header `x-user-id` de gia lap user khi goi API. Sau nay co the thay bang JWT.
