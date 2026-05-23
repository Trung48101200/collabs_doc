# WebSocket Events

Socket URL: `http://localhost:4000`

Socket.IO connection can token JWT:

```js
io("http://localhost:4000", {
  auth: {
    token: accessToken
  }
});
```

Backend verify token, check blacklist token, sau do gan user vao `socket.data.user`.

## Document room

### `join-document`

Client gui:

```json
{
  "documentId": 1,
  "user": {
    "name": "Demo User",
    "color": "#2f80ed"
  }
}
```

Server:

- Check user co quyen doc document.
- Cho socket vao room `document:<documentId>`.
- Cache role trong `socket.data.roles`.
- Broadcast `user-list`.

### `leave-document`

Client gui:

```json
{
  "documentId": 1
}
```

Server xoa socket khoi room va broadcast lai `user-list`.

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

Server:

- Check role `owner` hoac `editor`.
- Luu update vao `document_updates`.
- Merge update vao `documents.ydoc_state`.
- Broadcast `yjs-update` cho cac client khac trong room.

Viewer neu gui update se nhan:

```text
access-denied
```

## Offline/reconnect

### `sync-state-request`

Client gui:

```json
{
  "documentId": 1,
  "stateVector": [1, 2, 3]
}
```

Server lay `ydoc_state`, tinh phan update con thieu theo Yjs state vector, roi tra:

```text
sync-state-response
```

Payload:

```json
{
  "documentId": 1,
  "update": [1, 2, 3]
}
```

## Awareness/cursor

```text
awareness-update
cursor-update
selection-update
user-list
```

Server chi broadcast awareness/cursor neu socket dang o trong document room.

## Save/version

```text
save-document
document-saved
version-restored
```

Khi restore version qua HTTP API, backend emit `version-restored` den room document de cac client dang mo co the sync lai state.

## Security

- Socket connection bat buoc co JWT access token.
- `join-document` check quyen doc.
- `yjs-update` check quyen sua.
- Viewer khong the sua bang cach tu emit socket event.
