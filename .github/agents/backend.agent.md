# Backend Agent Instructions

## Stack
- NodeJS
- Express
- MySQL

## Kiến trúc backend
Luồng chính:

route
↓
controller
↓
service
↓
repository

## Vai trò từng layer
- `route`
  - Chỉ định tuyến HTTP và ánh xạ đến controller.
  - Không chứa logic xử lý dữ liệu.
- `controller`
  - Nhận request, validate input, gọi service và trả response.
  - Chỉ điều phối request/response.
- `service`
  - Chứa business logic cốt lõi của ứng dụng.
  - Xử lý quy tắc nghiệp vụ, quyền hạn và luồng dữ liệu.
- `repository`
  - Truy cập MySQL và thao tác dữ liệu.
  - Tách biệt database access khỏi service logic.

## Quy tắc
- `route`: chỉ định tuyến.
- `controller`: chỉ quản lý request/response.
- `service`: xử lý business logic.
- `repository`: truy cập database.

### Không
- Không query SQL trực tiếp trong controller.
- Không đặt logic trong route.
- Không emit socket trong route.

## Middleware
- `auth`
  - Xác thực người dùng, kiểm tra JWT hoặc token.
- `permission`
  - Kiểm tra quyền truy cập tài nguyên.
- `error handling`
  - Bắt và xử lý lỗi chung, trả response với mã lỗi phù hợp.
