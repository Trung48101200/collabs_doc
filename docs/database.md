# Database

Database: MySQL

Backend dung Sequelize ORM de map cac bang MySQL thanh model class. File khoi tao schema:

```text
backend/migrations/001_init.sql
```

Migration helper:

```text
backend/src/config/migrate.js
```

## Bang chinh

```text
users
documents
document_collaborators
document_versions
document_updates
refresh_tokens
blacklisted_tokens
```

## Sequelize models

| Model | Bang |
|---|---|
| `User` | `users` |
| `Document` | `documents` |
| `DocumentCollaborator` | `document_collaborators` |
| `DocumentVersion` | `document_versions` |
| `DocumentUpdate` | `document_updates` |
| `RefreshToken` | `refresh_tokens` |
| `BlacklistedToken` | `blacklisted_tokens` |

Relationship duoc khai bao trong:

```text
backend/src/models/index.js
```

## Huong luu rich text

Bang `documents` khong chi luu mot cot `content`. He thong tach thanh nhieu bieu dien:

| Cot | Vai tro |
|---|---|
| `content_text` | Preview, tim kiem, hien thi danh sach |
| `content_json` | Snapshot rich text cua TipTap |
| `content_html` | Render nhanh/export |
| `ydoc_state` | Trang thai cong tac realtime cua Yjs |

## Version va realtime update

| Bang | Vai tro |
|---|---|
| `document_versions` | Luu snapshot day du: text, JSON, HTML, Yjs snapshot |
| `document_updates` | Luu cac Yjs update nho tu Socket.IO |

Khi client gui `yjs-update`, backend luu update vao `document_updates`, merge vao `ydoc_state`, roi broadcast cho cac client khac.

Khi tao ban sao tai lieu, backend copy snapshot `content_text`, `content_json`, `content_html`, `ydoc_state` sang document moi, gan user hien tai lam `owner`, va khong copy collaborator cua document goc.

## Auth token

| Bang | Vai tro |
|---|---|
| `refresh_tokens` | Luu refresh token con hieu luc |
| `blacklisted_tokens` | Luu access token da logout/bi vo hieu hoa |

## Permission

| Role | Xem | Sua | Xoa | Moi user | Doi quyen | Restore |
|---|---|---|---|---|---|---|
| owner | Co | Co | Co | Co | Co | Co |
| editor | Co | Co | Khong | Khong | Khong | Co |
| viewer | Co | Khong | Khong | Khong | Khong | Khong |

Backend phai check permission o ca HTTP API va Socket.IO, khong chi khoa nut tren frontend.
Owner la nguoi tao tai lieu va khong duoc chuyen sang user khac trong phien ban hien tai.
