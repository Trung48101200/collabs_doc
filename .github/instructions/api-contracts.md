# API Contracts

## POST /api/auth/register
- method: POST
- body:
  - `email`: string
  - `password`: string
  - `name`: string
- response:
  - `userId`: string
  - `email`: string
  - `name`: string
  - `token`: string
- error:
  - `400` nếu thiếu trường bắt buộc hoặc dữ liệu không hợp lệ
  - `409` nếu email đã tồn tại
- permission: public

## POST /api/auth/login
- method: POST
- body:
  - `email`: string
  - `password`: string
- response:
  - `userId`: string
  - `email`: string
  - `name`: string
  - `token`: string
- error:
  - `400` nếu thiếu trường bắt buộc
  - `401` nếu đăng nhập thất bại
- permission: public

## GET /api/users/me
- method: GET
- body: none
- response:
  - `userId`: string
  - `email`: string
  - `name`: string
- error:
  - `401` nếu token không hợp lệ hoặc không cung cấp
- permission: authenticated

## GET /api/documents
- method: GET
- body: none
- response:
  - `documents`: array of document metadata
    - `id`: string
    - `title`: string
    - `updatedAt`: string
    - `ownerId`: string
- error:
  - `401` nếu không xác thực
- permission: authenticated

## POST /api/documents
- method: POST
- body:
  - `title`: string
  - `content?`: object or string
- response:
  - `id`: string
  - `title`: string
  - `createdAt`: string
  - `ownerId`: string
- error:
  - `400` nếu thiếu trường bắt buộc hoặc dữ liệu không hợp lệ
  - `401` nếu không xác thực
- permission: authenticated

## GET /api/documents/:id
- method: GET
- body: none
- response:
  - `id`: string
  - `title`: string
  - `content`: object or string
  - `updatedAt`: string
  - `ownerId`: string
- error:
  - `401` nếu không xác thực
  - `403` nếu không có quyền truy cập
  - `404` nếu không tìm thấy document
- permission: owner/editor/viewer

## PUT /api/documents/:id
- method: PUT
- body:
  - `title?`: string
  - `content?`: object or string
- response:
  - `id`: string
  - `title`: string
  - `updatedAt`: string
- error:
  - `400` nếu dữ liệu không hợp lệ
  - `401` nếu không xác thực
  - `403` nếu không có quyền chỉnh sửa
  - `404` nếu không tìm thấy document
- permission: owner/editor

## DELETE /api/documents/:id
- method: DELETE
- body: none
- response:
  - `message`: string
- error:
  - `401` nếu không xác thực
  - `403` nếu không có quyền
  - `404` nếu không tìm thấy document
- permission: owner

## GET /api/documents/:id/versions
- method: GET
- body: none
- response:
  - `versions`: array of version metadata
    - `versionId`: string
    - `createdAt`: string
    - `createdBy`: string
    - `summary`: string
- error:
  - `401` nếu không xác thực
  - `403` nếu không có quyền truy cập
  - `404` nếu không tìm thấy document
- permission: owner/editor/viewer

## POST /api/documents/:id/versions
- method: POST
- body:
  - `note?`: string
  - `snapshot?`: object or string
- response:
  - `versionId`: string
  - `createdAt`: string
- error:
  - `400` nếu dữ liệu không hợp lệ
  - `401` nếu không xác thực
  - `403` nếu không có quyền tạo phiên bản
  - `404` nếu không tìm thấy document
- permission: owner/editor

## GET /api/documents/:id/collaborators
- method: GET
- body: none
- response:
  - `collaborators`: array
    - `userId`: string
    - `email`: string
    - `role`: string
- error:
  - `401` nếu không xác thực
  - `403` nếu không có quyền xem
  - `404` nếu không tìm thấy document
- permission: owner/editor/viewer

## POST /api/documents/:id/collaborators
- method: POST
- body:
  - `userId`: string
  - `role`: string
- response:
  - `userId`: string
  - `role`: string
- error:
  - `400` nếu dữ liệu không hợp lệ
  - `401` nếu không xác thực
  - `403` nếu không có quyền
  - `404` nếu không tìm thấy document
- permission: owner

## GET /api/documents/:id/sync-state
- method: GET
- body: none
- response:
  - `syncState`: object
- error:
  - `401` nếu không xác thực
  - `403` nếu không có quyền truy cập
  - `404` nếu không tìm thấy document
- permission: owner/editor/viewer

## POST /api/documents/:id/sync-state
- method: POST
- body:
  - `syncState`: object
- response:
  - `status`: string
- error:
  - `400` nếu dữ liệu không hợp lệ
  - `401` nếu không xác thực
  - `403` nếu không có quyền
  - `404` nếu không tìm thấy document
- permission: owner/editor
