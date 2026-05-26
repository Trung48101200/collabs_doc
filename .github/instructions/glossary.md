# Glossary

## Document
- Định nghĩa: Tài liệu văn bản mà người dùng có thể chỉnh sửa và chia sẻ.
- Vai trò trong hệ thống: Là dữ liệu chính được cộng tác, lưu trữ, và đồng bộ qua Yjs và Socket.IO.
- Ví dụ: Một bài luận, ghi chú nhóm, hoặc bài viết hợp tác.

## Snapshot
- Định nghĩa: Bản chụp lại toàn bộ trạng thái document tại một thời điểm.
- Vai trò trong hệ thống: Dùng để lưu phiên bản hoặc khôi phục khi reconnect/reload.
- Ví dụ: Snapshot nội dung document khi người dùng nhấn lưu phiên bản.

## Yjs update
- Định nghĩa: Phiên bản thay đổi dạng incremental do Yjs tạo ra để đồng bộ nội dung.
- Vai trò trong hệ thống: Gửi qua socket để đồng bộ chỉnh sửa giữa các client mà không truyền toàn bộ document.
- Ví dụ: Một update chứa thay đổi định dạng, chèn văn bản, hoặc xóa đoạn.

## CRDT
- Định nghĩa: Conflict-free Replicated Data Type, cấu trúc dữ liệu cho phép đồng bộ ở chế độ phân tán mà không cần lock.
- Vai trò trong hệ thống: Yjs sử dụng CRDT để đảm bảo nhiều client chỉnh sửa đồng thời vẫn hợp nhất đúng.
- Ví dụ: Một đoạn văn bản được chèn cùng lúc bởi hai người dùng nhưng vẫn hiển thị hợp lệ cho cả hai.

## Awareness
- Định nghĩa: Thông tin trạng thái người dùng như con trỏ, selection, và trạng thái kết nối.
- Vai trò trong hệ thống: Giúp hiển thị vị trí người khác và trạng thái cộng tác realtime.
- Ví dụ: Hiển thị tên và con trỏ của người dùng khác trong editor.

## Collaborator
- Định nghĩa: Người dùng có quyền truy cập vào document và có thể tham gia chỉnh sửa hoặc xem.
- Vai trò trong hệ thống: Là thành viên cùng làm việc trên document với các quyền khác nhau.
- Ví dụ: Một thành viên nhóm được thêm vào document với role editor.

## Owner
- Định nghĩa: Người sở hữu document, có toàn quyền quản lý tài liệu.
- Vai trò trong hệ thống: Có thể mời cộng tác viên, chỉnh sửa quyền, và xóa document.
- Ví dụ: Người tạo document ban đầu.

## Editor
- Định nghĩa: Người dùng có quyền chỉnh sửa document nhưng không phải owner.
- Vai trò trong hệ thống: Có thể cập nhật nội dung và lưu phiên bản.
- Ví dụ: Thành viên nhóm sửa nội dung và đồng bộ với các client khác.

## Viewer
- Định nghĩa: Người dùng chỉ có quyền xem document, không thể chỉnh sửa.
- Vai trò trong hệ thống: Cho phép chia sẻ tài liệu ở chế độ chỉ đọc.
- Ví dụ: Người xem báo cáo mà không muốn họ thay đổi nội dung.

## Version
- Định nghĩa: Phiên bản lưu trữ của document tại một thời điểm cụ thể.
- Vai trò trong hệ thống: Dùng để truy xuất lịch sử và khôi phục nội dung trước đó.
- Ví dụ: Phiên bản trước khi thực hiện sửa lớn hoặc cập nhật nội dung quan trọng.

## Offline editing
- Định nghĩa: Khả năng thay đổi nội dung local khi mất kết nối mạng.
- Vai trò trong hệ thống: Giúp người dùng giữ tiếp công việc và đồng bộ lại khi reconnect.
- Ví dụ: Soạn thảo đoạn văn trong khi internet yếu và tự động gửi lại khi online.

## Reconnect sync
- Định nghĩa: Quá trình đồng bộ lại trạng thái document khi client kết nối lại sau gián đoạn.
- Vai trò trong hệ thống: Đảm bảo client nhận các update mới nhất và giữ dữ liệu nhất quán.
- Ví dụ: Client mất kết nối, sau đó reconnect và nhận các Yjs update mới từ room document.
