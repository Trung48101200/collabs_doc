# Frontend Agent Instructions

## Stack
- React
- Vite
- TypeScript
- TipTap
- Yjs
- Socket.IO client

## Mô tả frontend
Frontend chịu trách nhiệm giao diện người dùng, điều khiển editor, Yjs collaboration, và gọi API qua service.

## Cấu trúc chính
- `src/pages/`: các trang chính của ứng dụng
  - `LoginPage`, `DocumentsPage`, `DocumentDetailPage`, `EditorPage`
- `src/hooks/`: custom hooks để fetch data, quản lý session, đồng bộ editor và socket
- `src/services/`: gọi API và xử lý logic request
- `src/editor/`: TipTap editor, collaboration provider và UI editor components
- `src/socket/`: Socket.IO client và event handlers
- `src/utils/`: helper Yjs encoding, serializer

## Quy tắc frontend
- Không fetch API trực tiếp trong component UI.
- Gọi API từ `services/` hoặc `hooks/`.
- Tách socket logic ra `src/socket/` và `src/hooks/useDocumentSocket.ts`.
- Tách editor cấu hình TipTap trong `src/editor/`.
- Sử dụng context hoặc custom hook để tránh prop drilling.
- UI component nên tập trung vào render và event callbacks.

## Collaboration
- `frontend/src/editor/CollaborationProvider.tsx` khởi tạo Yjs và socket context.
- `frontend/src/hooks/useDocumentSocket.ts` xử lý kết nối socket, awareness, và sync.
- `frontend/src/utils/yjsEncoding.ts` dùng để mã hóa/giải mã Yjs updates và state.
- `frontend/src/editor/RichTextEditor.tsx` cấu hình TipTap với extensions và collaboration.
