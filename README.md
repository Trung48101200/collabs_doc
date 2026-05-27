# TÀI LIỆU HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG SOẠN THẢO VĂN BẢN CỘNG TÁC (COLLABORATIVE DOCUMENT EDITING SYSTEM)

Dự án này là hệ thống phần mềm hỗ trợ soạn thảo văn bản cộng tác định dạng Rich-Text theo thời gian thực (Real-time).

## 1. Công nghệ sử dụng

- **Frontend**: React, Vite, TipTap (Rich Text Editor), Yjs, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Sequelize ORM, MySQL.
- **Real-time Sync**: Đồng bộ hoá văn bản thời gian thực thông qua thuật toán Yjs và Socket.IO.
- **Cơ sở dữ liệu (Database)**: MySQL lưu trữ dữ liệu văn bản với đa định dạng (content_text, content_json, content_html, và trạng thái văn bản ydoc_state).

## 2. Cấu trúc mã nguồn

\\\	ext
backend/   Chứa mã nguồn Express API, Socket.IO, Sequelize ORM và các service tương tác với MySQL.
frontend/  Chứa mã nguồn giao diện (React UI), TipTap editor nghiệp vụ và xử lý Socket Client.
docs/      Chứa tài liệu đặc tả API, Database schema và danh sách các sự kiện WebSocket.
\\\

*Ghi chú: Kiến trúc phía Backend được phân chia theo dạng module/domain trong thư mục \ackend/src/modules\ (bao gồm các module chính: \uth\, \user\, \document\).*

---

## 3. Triển khai thông qua Docker (Docker Environment - Khuyên dùng)

Hệ thống cung cấp giải pháp đóng gói qua Docker nhằm đảm bảo tính đồng nhất, thao tác nhanh chóng giữa các môi trường triển khai. Hệ thống cho phép người dùng khởi chạy toàn bộ dịch vụ mà không cần cài đặt các nền tảng phụ thuộc một cách thủ công.

1. Yêu cầu hệ thống đã khởi động Docker Engine (ví dụ: Docker Desktop).
2. Từ thư mục gốc của dự án, tiến hành thực thi câu lệnh điều phối sau:
   ```bash
   docker-compose up --build -d
   ```
3. Cấu trúc mạng Docker Compose sẽ thiết lập sẵn 3 container độc lập cùng tương tác:
   - **MySQL Container**: Phơi xuất cổng `3309` (thông tin mật khẩu và dữ liệu được khởi tạo nội bộ trong file config).
   - **Backend Container**: Dịch vụ vận hành ở cổng `5000` (Truy cập API: http://localhost:5000). Hệ thống khi bật bằng Docker sẽ tự động chạy file migration.
   - **Frontend Container**: Dịch vụ vận hành ở cổng `3000` (Giao diện tương tác người dùng: http://localhost:3000).
4. Để tiến hành chấm dứt hoạt động của toàn bộ các dịch vụ trên, sử dụng lệnh:
   ```bash
   docker-compose down
   ```

---

## 4. Hướng dẫn thiết lập cục bộ (Local Environment - Thủ công)

Thay vì thiết lập qua Docker, phương thức local này cho phép triển khai mã nguồn trực tiếp để phục vụ các yêu cầu theo dõi quá trình xử lý cục bộ và gỡ lỗi (debug).

### 4.1. Yêu cầu môi trường
- **Node.js**: Phiên bản LTS (yêu cầu cấu hình v18 hoặc v20 trở lên).
- **Hệ quản trị CSDL**: MySQL Server (thiết lập trực tiếp ở nền tảng hệ điều hành).

### 4.2. Cài đặt các gói thư viện (Dependencies)
Tại thư mục gốc (root) của dự án, tiến hành thực thi câu lệnh để tự động cài đặt các cấu kiện thành phần phụ thuộc (package) cho toàn bộ hệ thống phân rẽ:

```bash
npm run install:all
```

### 4.3. Thiết lập biến môi trường
Hệ thống yêu cầu các tệp tin cấu hình môi trường `.env` riêng biệt cho từng phân hệ. Tiến hành sao chép các tệp thiết định mẫu:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

> **Lưu ý quan trọng:** Cần tiến hành mở tệp `backend/.env` để cập nhật các tham số kết nối cơ sở dữ liệu (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`) nhằm đồng bộ phiên làm việc MySQL cục bộ của hệ máy tính.

### 4.4. Khởi tạo Cơ sở dữ liệu
Tiến hành tạo ra một Schema mới trên MySQL (gợi ý tên cơ sở dữ liệu: `collab_docs`). Kế tiếp, chạy lệnh chuyên trách sau từ thư mục gốc để tiến hành thực thi quá trình sinh bảng cho Database:

```bash
npm run migrate
```

*(Lựa chọn thay thế: Người dùng có thể khởi tạo các cấu trúc bảng một cách thủ công thông qua việc chạy tệp mã lệnh `backend/migrations/001_init.sql` trên các giao diện phần mềm quản trị CSDL).*

### 4.5. Khởi động Ứng dụng
Để tiến hành khởi chạy phân hệ Backend và Frontend đồng thời trực tiếp, sử dụng thao tác lệnh:

```bash
npm run dev
```

Hệ thống sẽ khả dụng tại các địa chỉ mặc định sau:
- **Backend API**: `http://localhost:4000`
- **Frontend App**: `http://localhost:5173`
- **Tài liệu Swagger API**: `http://localhost:4000/api-docs`

---

## 5. Cơ chế xác thực và Bảo mật
- **Xác thực JWT (JSON Web Token)**: Hệ thống duy trì các quy chuẩn bảo mật định danh, chia tách Access Token (thời gian sống ngắn) và Refresh Token nhằm tối ưu hiệu năng tái cấp quyền.
- **Thu hồi quyền truy cập (Blacklisting)**: Hệ thống cho phép trực tiếp vô hiệu hoá phiên làm việc của người dùng vào danh sách đen thông qua cơ chế Blacklist Token khi nhận được luồng sự kiện Đăng xuất (Logout).
