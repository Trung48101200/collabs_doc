# Database Agent Instructions

## Database
- MySQL

## Tables

### users
- purpose: Lưu thông tin người dùng và xác thực.
- schema:
  - `id`: string / UUID
  - `email`: string
  - `name`: string
  - `passwordHash`: string
  - `createdAt`: datetime
  - `updatedAt`: datetime
- relation:
  - `users.id` liên kết với `documents.ownerId`
  - `users.id` liên kết với `document_collaborators.userId`
- ví dụ record:
  - `id`: `user-123`
  - `email`: `alice@example.com`
  - `name`: `Alice`
  - `passwordHash`: `$2b$...`
  - `createdAt`: `2026-05-23T10:00:00Z`
  - `updatedAt`: `2026-05-23T10:00:00Z`

### documents
- purpose: Lưu metadata và nội dung của tài liệu.
- schema:
  - `id`: string / UUID
  - `title`: string
  - `ownerId`: string
  - `content_text`: text
  - `content_json`: json
  - `content_html`: text
  - `ydoc_state`: blob / longblob
  - `createdAt`: datetime
  - `updatedAt`: datetime
- relation:
  - `documents.ownerId` tham chiếu `users.id`
  - `documents.id` liên kết với `document_versions.documentId`
  - `documents.id` liên kết với `document_collaborators.documentId`
  - `documents.id` liên kết với `document_updates.documentId`
- ví dụ record:
  - `id`: `doc-456`
  - `title`: `Project Plan`
  - `ownerId`: `user-123`
  - `content_text`: `Project plan preview...`
  - `content_json`: `{ ... TipTap JSON ... }`
  - `content_html`: `<p>Project plan preview...</p>`
  - `ydoc_state`: `<binary ydoc state>`
  - `createdAt`: `2026-05-23T10:05:00Z`
  - `updatedAt`: `2026-05-23T10:05:00Z`

### document_collaborators
- purpose: Lưu thông tin quyền truy cập của cộng tác viên trên từng tài liệu.
- schema:
  - `id`: string / UUID
  - `documentId`: string
  - `userId`: string
  - `role`: string (`owner`|`editor`|`viewer`)
  - `createdAt`: datetime
  - `updatedAt`: datetime
- relation:
  - `document_collaborators.documentId` tham chiếu `documents.id`
  - `document_collaborators.userId` tham chiếu `users.id`
- ví dụ record:
  - `id`: `collab-789`
  - `documentId`: `doc-456`
  - `userId`: `user-234`
  - `role`: `editor`
  - `createdAt`: `2026-05-23T10:10:00Z`
  - `updatedAt`: `2026-05-23T10:10:00Z`

### document_versions
- purpose: Lưu phiên bản snapshot của tài liệu theo thời gian.
- schema:
  - `id`: string / UUID
  - `documentId`: string
  - `createdBy`: string
  - `note`: string
  - `snapshot`: json / text
  - `createdAt`: datetime
- relation:
  - `document_versions.documentId` tham chiếu `documents.id`
  - `document_versions.createdBy` tham chiếu `users.id`
- ví dụ record:
  - `id`: `version-001`
  - `documentId`: `doc-456`
  - `createdBy`: `user-123`
  - `note`: `Initial version`
  - `snapshot`: `{ ... document snapshot ... }`
  - `createdAt`: `2026-05-23T10:15:00Z`

### document_updates
- purpose: Lưu Yjs incremental update để hỗ trợ đồng bộ hoặc debug.
- schema:
  - `id`: string / UUID
  - `documentId`: string
  - `update`: blob / longblob
  - `createdAt`: datetime
- relation:
  - `document_updates.documentId` tham chiếu `documents.id`
- ví dụ record:
  - `id`: `update-001`
  - `documentId`: `doc-456`
  - `update`: `<binary yjs update>`
  - `createdAt`: `2026-05-23T10:16:00Z`

## Quan hệ tổng quát
- User
  ↓
  Documents
- Documents
  ↓
  Versions
- Documents
  ↓
  Collaborators
- Documents
  ↓
  Updates

## Ghi chú
- `documents` lưu cả `content_text`, `content_json`, `content_html`, và `ydoc_state`.
- `document_updates` lưu Yjs incremental update.
- `document_versions` lưu snapshot document.
