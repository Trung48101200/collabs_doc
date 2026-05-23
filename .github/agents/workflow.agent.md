# Workflow Agent Instructions

## Workflow thêm tính năng
1. Đọc code liên quan để hiểu kiến trúc hiện tại.
2. Xác định API cần thêm hoặc mở rộng.
3. Xác định socket event cần dùng cho realtime.
4. Kiểm tra permission và authorization trước khi triển khai.
5. Cập nhật frontend theo cấu trúc component/hook/service.
6. Test realtime để đảm bảo Yjs update và broadcast đúng.
7. Test reconnect để đảm bảo client khôi phục trạng thái sau mất kết nối.
8. Test nhiều user để kiểm tra đồng bộ và chia sẻ live.

## Workflow fix bug
1. Tìm root cause của bug.
2. Sửa ít nhất có thể để khắc phục, ưu tiên patch cục bộ.
3. Không rewrite toàn bộ file.
4. Giữ tương thích với behavior hiện tại.

## Workflow refactor
- Không thay đổi behavior.
- Giữ nguyên chức năng khi tái cấu trúc.
- Tăng readability và maintainability.
- Tránh nâng cấp quá mức nếu không cần.
