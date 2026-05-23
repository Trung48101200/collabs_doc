# Backend Workflow

Backend dung Express + Sequelize ORM + MySQL. Code duoc chia theo module/domain va cac lop ro rang:

```text
modules/<domain>/routes -> controllers -> services -> repositories -> Sequelize models -> MySQL
```

## Cau truc module

```text
backend/src/
  modules/
    auth/
      auth.routes.js
      token.model.js
      token.repository.js
    user/
      user.model.js
      user.repository.js
    document/
      document.model.js
      document-collaborator.model.js
      document-version.model.js
      document-update.model.js
      document.repository.js
      document.service.js
      document.controller.js
      collaborator.controller.js
      document.routes.js
  models/
    index.js
```

## Quy tac code

- Route chi khai bao endpoint va middleware.
- Controller chi doc request, goi service, tra response.
- Service xu ly nghiep vu va permission.
- Repository thao tac du lieu bang Sequelize model.
- Khong viet SQL trong controller/service.
- WebSocket update cung phai di qua service permission.

## Permission

| Role | Quyen |
|---|---|
| owner | Xem, sua, xoa, moi user, doi quyen, restore version |
| editor | Xem, sua, tao version |
| viewer | Chi xem |

## Luong realtime update

1. Client gui `yjs-update` qua Socket.IO.
2. Socket handler goi `DocumentService.acceptRealtimeUpdate`.
3. Service kiem tra role `owner` hoac `editor`.
4. Repository luu update vao `document_updates` va merge vao `ydoc_state`.
5. Server broadcast update cho cac client khac trong room.

## Luong tao ban sao tai lieu

1. User goi `POST /api/documents/:id/copy`.
2. Service kiem tra user co quyen doc document goc.
3. Repository copy snapshot sang document moi.
4. User hien tai duoc gan role `owner` cua ban sao.
5. Collaborator cua document goc khong duoc copy sang ban sao.
