# Database

Database: MySQL

File khoi tao:

```text
backend/migrations/001_init.sql
```

## Bang chinh

```text
users
documents
document_collaborators
document_versions
document_updates
```

## Huong luu JSON

Bang `documents` khong chi luu mot cot `content`. He thong tach thanh:

| Cot | Vai tro |
|---|---|
| `content_text` | Preview, tim kiem, hien thi danh sach |
| `content_json` | Snapshot rich text cua TipTap |
| `content_html` | Render nhanh/export |
| `ydoc_state` | Trang thai cong tac realtime cua Yjs |

## Permission

| Role | Xem | Sua | Xoa | Moi user | Doi quyen | Restore |
|---|---|---|---|---|---|---|
| owner | Co | Co | Co | Co | Co | Co |
| editor | Co | Co | Khong | Khong | Khong | Tuy chon |
| viewer | Co | Khong | Khong | Khong | Khong | Khong |
