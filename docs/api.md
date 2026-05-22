# API HTTP

Base URL: `http://localhost:4000`

Skeleton dang dung header demo:

```text
x-user-id: 1
x-user-name: Demo User
```

## Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Auth hien tai la khung demo. Khi lam that, thay bang JWT.

## Documents

### Lay danh sach tai lieu

```text
GET /api/documents
```

Response:

```json
[
  {
    "id": 1,
    "title": "Tai lieu moi",
    "contentText": "Preview text",
    "ownerId": 1,
    "currentVersion": 1,
    "updatedAt": "2026-05-22T03:00:00.000Z",
    "role": "owner"
  }
]
```

### Tao tai lieu

```text
POST /api/documents
```

Request:

```json
{
  "title": "Bao cao he thong phan tan"
}
```

### Mo tai lieu

```text
GET /api/documents/:id
```

Response:

```json
{
  "id": 1,
  "title": "Bao cao he thong phan tan",
  "contentText": "Hello world",
  "contentJson": {
    "type": "doc",
    "content": []
  },
  "contentHtml": "<p>Hello world</p>",
  "ownerId": 1,
  "currentVersion": 1,
  "role": "editor"
}
```

### Luu snapshot rich text

```text
PUT /api/documents/:id
```

Request:

```json
{
  "title": "Bao cao he thong phan tan",
  "contentText": "Hello world edited",
  "contentJson": {
    "type": "doc",
    "content": []
  },
  "contentHtml": "<p>Hello world edited</p>",
  "ydocState": "base64-encoded-yjs-state"
}
```

## Versioning

```text
GET  /api/documents/:id/versions
POST /api/documents/:id/versions
```

Version luu snapshot gom `content_text`, `content_json`, `content_html`, `ydoc_snapshot`.
