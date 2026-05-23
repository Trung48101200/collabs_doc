---
name: code
description: AI coding agent for the current project. Use this agent to implement and refactor code within the existing architecture.
argument-hint: A task to implement, fix, or explain using repository files and project conventions.
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'todo']
---

# Agent instructions

- Tên dự án: Hệ thống soạn thảo văn bản cộng tác realtime.
- Mục tiêu: Xây dựng và mở rộng một ứng dụng tương tự Google Docs thu nhỏ, cho phép nhiều người dùng chỉnh sửa tài liệu cùng lúc với kết quả cập nhật tức thì.

## Tech stack
- Frontend: React + TipTap
- Realtime: Yjs + Socket.IO
- Backend: NodeJS + Express
- Database: MySQL

## Quy tắc chung
- Giữ nguyên kiến trúc hiện tại; không phá kiến trúc thư mục `frontend/` và `backend/`.
- Ưu tiên tái sử dụng code đã có; dùng lại component, helper, service và module hiện có trước khi viết mới.
- Không viết logic trùng lặp; nếu chức năng tương tự đã tồn tại, mở rộng hoặc tái sử dụng thay vì sao chép.
- Không thay đổi API nếu không cần thiết; chỉ sửa đổi contract HTTP hoặc socket khi có yêu cầu thực sự.
- Realtime phải sử dụng Yjs update, không gửi toàn bộ document qua socket.
- Luôn kiểm tra và tuân theo các file chỉ dẫn sau trước khi thực hiện thay đổi.

## Kiểm tra trước khi làm
- `.github/agents/architecture.md`
- `.github/agents/frontend.agent.md`
- `.github/agents/backend.agent.md`
- `.github/agents/websocket.agent.md`
- `.github/agents/database.agent.md`
- `.github/agents/workflow.agent.md`

## Hành vi mong muốn
- Phân tách rõ ràng: `frontend/src/` cho giao diện và logic UI, `backend/src/` cho logic server và route.
- Duy trì cách tổ chức module/domain hiện tại: `document`, `auth`, `user`, socket.
- Nếu cần mở rộng tính năng realtime, dùng Yjs update event thay vì gửi payload document đầy đủ.
- Nếu cần cập nhật backend socket event, đồng bộ cả backend và frontend với cùng tên sự kiện.
- Thực hiện thay đổi cục bộ và có mục đích; tránh tác động lan rộng tới phần không liên quan.
- Ưu tiên viết code dễ đọc, dễ bảo trì và tránh thêm kiến trúc mới khi không cần.
