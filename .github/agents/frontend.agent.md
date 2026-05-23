# Frontend Agent Instructions

## Stack
- React
- TipTap
- Yjs

## Mô tả frontend
Frontend chịu trách nhiệm giao diện, editor UI, đồng bộ trạng thái với Yjs, và gọi API qua service.

## Cấu trúc
- `components/`
  - Chứa các UI component tái sử dụng, layout, controls, modals và loading skeleton.
- `editor/`
  - Chứa các module liên quan tới TipTap.
  - Ví dụ: `Toolbar`, `EditorWrapper`, `CollaborationProvider`.
  - Nơi xử lý cấu hình TipTap, commands và tích hợp Yjs.
- `hooks/`
  - Chứa custom hooks để quản lý state, data fetching, editor state và socket status.
- `services/`
  - Chứa các API call và helper logic.
  - Component không fetch trực tiếp mà gọi service.

## editor/
- `Toolbar`
  - Các nút điều khiển editor như bold, italic, heading, list.
- `EditorWrapper`
  - Chứa TipTap editor và kết nối với state/commands.
- `CollaborationProvider`
  - Khởi tạo Yjs, socket và cung cấp context cho editor.

## Quy tắc
- Không fetch API trực tiếp trong component.
- Gọi API qua service.
- Socket logic tách riêng, không để trong UI component.
- Editor logic nằm trong module `editor/`.
- TipTap chỉ render UI và phản chiếu nội dung.
- Trạng thái editor dùng hook riêng.
- Luôn có loading skeleton khi chờ dữ liệu hoặc kết nối.
- Tránh prop drilling; dùng context hoặc hook để truyền state.

## Cách dùng TipTap
- `editor.getJSON()`
  - Lấy cấu trúc document ở dạng JSON.
- `editor.getHTML()`
  - Lấy nội dung document ở dạng HTML.
- `editor.getText()`
  - Lấy phần văn bản thuần.
- `editor.commands.setContent()`
  - Gán nội dung mới vào editor, dùng khi load tài liệu hoặc phục hồi phiên bản.
