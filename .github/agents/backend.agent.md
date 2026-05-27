# Backend Agent Instructions

## Stack
- Node.js
- Express
- Sequelize
- MySQL
- Socket.IO

## Kiến trúc backend
Luồng chính:

route → controller → service → repository

## Vai trò từng layer
- `route`
  - Định nghĩa endpoint và ánh xạ request đến controller.
  - Không chứa business logic.
- `controller`
  - Nhận request, validate input, gọi service, trả response.
  - Không vào repository hoặc DB trực tiếp.
- `service`
  - Chứa business logic và quyền hạn.
  - Tương tác với repository và socket service khi cần.
- `repository`
  - Truy cập database và Sequelize models.
  - Tách biệt data access khỏi service logic.

## Quy tắc
- Không query database trực tiếp trong controller hoặc route.
- Không đặt business logic trong route.
- Không emit socket trong route files.
- Socket update/persistence điều hướng qua socket module (`backend/src/sockets/document.socket.js`) và service/repository, không qua route.
- Dùng `async/await` cho DB và socket handler.

## Cấu trúc chính
- `backend/src/modules/auth/`
- `backend/src/modules/user/`
- `backend/src/modules/document/`
- `backend/src/sockets/document.socket.js`
- `backend/src/config/db.js`

## Middleware cần lưu ý
- `auth.middleware.js`: xác thực JWT, đọc token, xác định người dùng.
- `error.middleware.js`: xử lý lỗi chung và trả response phù hợp.
