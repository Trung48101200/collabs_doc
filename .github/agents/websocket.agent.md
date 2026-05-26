# Websocket Agent Instructions

## Mô tả realtime collaboration
Hệ thống realtime collaboration dùng Socket.IO để đồng bộ Yjs state giữa client và server theo phòng tài liệu.

## Socket events chính
- `join-document`
- `leave-document`
- `yjs-update`
- `awareness-update`
- `cursor-update`
- `save-document`
- `create-version`
- `sync-state-request`

## Quy tắc
- Không gửi toàn bộ document qua socket.
- Chỉ gửi Yjs incremental update và awareness/cursor state.
- Server dùng room theo mẫu `document:{id}`.
- Trước khi nhập room hoặc xử lý Yjs update, server phải xác thực và kiểm tra quyền truy cập.
- Nếu có thay đổi event contract, cập nhật đồng thời cả backend và frontend.

## Flow chính
### Join
- Client gọi `join-document` khi mở editor.
- Backend xác thực token, kiểm tra access, rồi join room `document:{id}`.
- Backend trả về trạng thái ban đầu hoặc yêu cầu sync.

### Sync
- Client gửi `yjs-update` incremental khi editor thay đổi.
- Backend persist update và broadcast lại đến các client khác cùng room.
- Backend có thể trả trạng thái khác nếu client reconnect.

### Awareness/cursor
- Events awareness và cursor chỉ broadcast tới room hiện tại.
- Client phải gửi thông tin vị trí/awareness hiện tại để hiển thị collaborator.

### Reconnect
- Sau mất kết nối, client reconnect và có thể gửi `sync-state-request`/`join-document` lại.
- Backend gửi lại các update cần thiết dựa trên state vector.

## Tài liệu tham khảo
- `backend/src/sockets/document.socket.js`
- `frontend/src/hooks/useDocumentSocket.ts`
- `frontend/src/socket/socketHandlers.ts`
- `frontend/src/socket/socketEvents.ts`
