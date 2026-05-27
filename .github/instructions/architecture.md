# Architecture

## Tổng quan hệ thống
Hệ thống collaborative editor gồm các lớp chính:

User
↓
React + TipTap
↓
Yjs
↓
Socket.IO
↓
Node + Express
↓
MySQL

## Frontend
Frontend chịu trách nhiệm hiển thị giao diện, quản lý trạng thái người dùng, và tích hợp editor với Yjs để đồng bộ realtime.

- `pages/`
  - Chứa các trang chính của ứng dụng.
  - Ví dụ: trang danh sách tài liệu, trang chỉnh sửa tài liệu, trang đăng nhập.
- `components/`
  - Chứa các component UI tái sử dụng chung.
  - Ví dụ: toolbar, modal, loading indicator, document card.
- `hooks/`
  - Chứa custom hooks để tách logic state, data fetching, socket/Yjs integration.
  - Ví dụ: hook lấy document, hook quản lý authentication, hook đồng bộ Yjs.
- `services/`
  - Chứa các helper gọi API và xử lý request tới backend.
  - Ví dụ: `documentApi`, `authApi`, `userApi`.
- `editor/`
  - Chứa các component và helper liên quan đến TipTap editor.
  - Ví dụ: `RichTextEditor`, `EditorToolbar`, cấu hình extension, xử lý update editor.

## Backend
Backend chịu trách nhiệm xác thực, điều phối API, xử lý socket realtime và lưu trữ dữ liệu vào MySQL.

- `routes/`
  - Định nghĩa các endpoint HTTP và ánh xạ tới controller.
  - Ví dụ: route tài liệu, route user, route auth.
- `controllers/`
  - Nhận request từ route, validate đầu vào, và gọi service tương ứng.
  - Controller chỉ điều phối request/response, không chứa business logic nặng.
- `services/`
  - Chứa business logic cốt lõi của ứng dụng.
  - Ví dụ: logic tạo tài liệu, cập nhật quyền truy cập, xử lý lưu phiên bản.
- `middlewares/`
  - Chứa các middleware chung như xác thực JWT, xử lý lỗi, kiểm tra quyền.
- `socket/`
  - Chứa logic Socket.IO và tích hợp Yjs update.
  - Xử lý join room, broadcast update, kiểm tra quyền truy cập realtime.
- `repositories/`
  - Chứa truy vấn vào MySQL và abstract layer truy xuất dữ liệu.
  - Giúp tách biệt database access khỏi service logic.

## Giải thích flow

### Realtime sync flow
1. Người dùng mở tài liệu trong React.
2. Frontend khởi tạo TipTap và Yjs document.
3. Frontend kết nối Socket.IO tới backend và tham gia room tài liệu.
4. Backend xác thực người dùng và cho phép join room nếu có quyền.
5. Khi người dùng chỉnh sửa, TipTap tạo update và đẩy sang Yjs.
6. Yjs sinh update nhỏ gọn và gửi qua Socket.IO.
7. Backend nhận update, xác thực và phát lại cho các client khác trong room.
8. Các client khác áp dụng update vào Yjs document local để đồng bộ nội dung.

### Autosave flow
1. Frontend theo dõi thay đổi trong Yjs hoặc TipTap.
2. Khi đạt ngưỡng thời gian hoặc số thay đổi, frontend gọi API autosave.
3. Backend nhận request autosave qua route HTTP.
4. Backend lưu trạng thái document hiện tại hoặc phiên bản mới vào MySQL.
5. Backend trả về kết quả lưu trữ, frontend cập nhật trạng thái loading/saved.

### Version flow
1. Khi tạo hoặc cập nhật document, backend có thể lưu phiên bản mới vào bảng version.
2. Mỗi phiên bản lưu metadata như `documentId`, `author`, `timestamp`, `delta` hoặc snapshot.
3. Người dùng có thể truy vấn danh sách phiên bản qua API.
4. Người dùng chọn phiên bản và backend trả về nội dung/metadata tương ứng.
5. Frontend có thể hiển thị lịch sử hoặc khôi phục phiên bản từ dữ liệu này.

### Reconnect flow
1. Nếu kết nối Socket.IO bị gián đoạn, frontend phát hiện mất kết nối.
2. Frontend tự động thử reconnect theo một chiến lược lặp lại.
3. Khi kết nối lại thành công, frontend gửi lại thông tin document và trạng thái user.
4. Backend kiểm tra lại quyền truy cập và cho phép client join room.
5. Backend có thể gửi snapshot Yjs hiện tại hoặc cho phép client đồng bộ với update mới nhất.
6. Yjs đảm bảo client reconnect nhận được trạng thái document đồng bộ mà không cần tải lại toàn bộ nội dung.
