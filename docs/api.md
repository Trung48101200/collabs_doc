# API HTTP

Base URL: `http://localhost:4000`

Swagger UI: `http://localhost:4000/api-docs`

Backend hien dung JWT. Cac API document can header:

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

## Auth

### Dang ky

```text
POST /api/auth/register
```

Request:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "123456"
}
```

### Dang nhap

```text
POST /api/auth/login
```

Response tra ve `accessToken`, `refreshToken` va thong tin user.

### Refresh token

```text
POST /api/auth/refresh
```

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Dang xuat

```text
POST /api/auth/logout
```

Logout se blacklist access token hien tai va xoa refresh token neu client gui len.

### Lay user hien tai

```text
GET /api/auth/me
```

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
  "ydocState": "base64-encoded-yjs-state",
  "ownerId": 1,
  "currentVersion": 1,
  "role": "editor"
}
```

### Luu snapshot rich text

```text
PUT /api/documents/:id
```

Chi `owner` va `editor` duoc luu.

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

### Xoa tai lieu

```text
DELETE /api/documents/:id
```

Chi `owner` duoc xoa.

### Tao ban sao tai lieu

```text
POST /api/documents/:id/copy
```

User co quyen xem tai lieu, gom `owner`, `editor`, `viewer`, deu co the tao ban sao. Ban sao moi thuoc ve user hien tai voi role `owner`, khong copy danh sach collaborator cua tai lieu goc.

Request tuy chon:

```json
{
  "title": "Ban sao bao cao"
}
```

Neu khong truyen `title`, backend tu dat ten theo dang:

```text
<title goc> (Copy)
```

## Collaborators

```text
GET    /api/documents/:id/collaborators
POST   /api/documents/:id/collaborators
PUT    /api/documents/:id/collaborators/:userId
DELETE /api/documents/:id/collaborators/:userId
```

Them collaborator:

```json
{
  "email": "editor@example.com",
  "role": "editor"
}
```

Role hop le khi moi/doi quyen collaborator:

```text
editor
viewer
```

Chi `owner` duoc moi user va doi quyen user khac. He thong khong ho tro doi owner tai lieu.

## Versioning

```text
GET  /api/documents/:id/versions
POST /api/documents/:id/versions
GET  /api/documents/:id/versions/:versionId
POST /api/documents/:id/versions/:versionId/restore
```

Version luu snapshot gom `content_text`, `content_json`, `content_html`, `ydoc_snapshot`.

Khi restore version, backend cap nhat lai bang `documents` va emit Socket.IO event `version-restored` cho cac client dang mo document.
