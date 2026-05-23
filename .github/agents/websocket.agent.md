# Websocket Agent Instructions

## Mô tả realtime collaboration
Realtime collaboration dùng Socket.IO để kết nối client và server, đồng bộ trạng thái editor theo room tài liệu.

## Socket event
- `join-document`
- `leave-document`
- `yjs-update`
- `awareness-update`
- `cursor-update`
- `selection-update`
- `save-document`
- `create-version`
- `reconnect-sync`

## Quy tắc
- Không gửi toàn bộ content qua websocket.
- Chỉ gửi Yjs incremental update.
- Server sử dụng room theo mẫu `document:{id}`.
- Luôn kiểm tra permission trước khi nhận update.

## Mô tả flow
### Join
- Client gửi event `join-document` khi mở tài liệu.
- Server xác thực token, kiểm tra quyền truy cập.
- Nếu hợp lệ, client được join room `document:{id}`.

### Sync
- Sau khi join, client và server đồng bộ trạng thái Yjs.
- Client gửi `yjs-update` incremental.
- Server phát lại update cho các client khác trong cùng room.

### Broadcast
- Server nhận `yjs-update` và broadcast cho room `document:{id}`.
- Các event awareness, cursor, selection cũng broadcast đến room tương ứng.
- Chỉ những client trong room mới nhận update.

### Disconnect
- Client gửi `leave-document` khi thoát tài liệu.
- Server remove client khỏi room và dọn dẹp trạng thái nếu cần.

### Reconnect
- Khi mất kết nối, client tự động reconnect.
- Client gửi `reconnect-sync` hoặc join lại room.
- Server xác thực và gửi lại trạng thái hoặc update mới nhất.
