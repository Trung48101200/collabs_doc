# WebSocket Events

Socket URL: `http://localhost:4000`

## Document room

### `join-document`

Client gui:

```json
{
  "documentId": 1,
  "user": {
    "id": 1,
    "name": "Demo User",
    "color": "#2f80ed"
  }
}
```

Server cho socket vao room `document:1` va broadcast `user-list`.

### `leave-document`

Client gui:

```json
{
  "documentId": 1,
  "userId": 1
}
```

## Realtime sync

### `yjs-update`

Client gui Yjs update nho, khong gui toan bo JSON:

```json
{
  "documentId": 1,
  "userId": 1,
  "update": [1, 2, 3],
  "clientId": "socket-id"
}
```

Server broadcast lai cho cac client khac trong cung room.

## Awareness/cursor

```text
awareness-update
cursor-update
selection-update
user-list
```

## Save/version

```text
save-document
document-saved
create-version
version-created
```

## Offline/reconnect

```text
reconnect-sync
pending-updates
sync-completed
user-disconnected
```

Ghi chu: offline editing trong skeleton da co `y-indexeddb` phia client de giu Yjs state local. Can hoan thien them UI va replay pending updates khi lam ban chinh.
