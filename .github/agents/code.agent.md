---
name: code
description: AI coding agent for the current project. Use this agent to implement and refactor code within the existing architecture.
argument-hint: A task to implement, fix, or explain using repository files and project conventions.
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'todo']
---

# Agent instructions

- Dự án: hệ thống soạn thảo văn bản cộng tác realtime.
- Mục tiêu: mở rộng, sửa lỗi và cải thiện code trong kiến trúc hiện tại, giữ nguyên vùng `frontend/` và `backend/`.

## Tech stack
- Frontend: React + Vite + TypeScript + TipTap
- Realtime: Yjs + Socket.IO
- Backend: Node.js + Express + Sequelize + MySQL

## Quy tắc chung
- Giữ nguyên cấu trúc hiện có; không đổi tổ chức `frontend/` và `backend/` nếu không cần.
- Tái sử dụng component, hook, service, repository và module hiện có trước khi thêm mới.
- Không lặp logic; mở rộng hoặc tái sử dụng chức năng đã có.
- Không thay đổi API hoặc socket contract trừ khi có yêu cầu rõ ràng.
- Realtime phải dùng Yjs incremental update, không gửi toàn bộ document.
- Kiểm tra các tài liệu agent trước khi làm: `AGENTS.md`, `.github/copilot-instructions.md`, `.github/agents/backend.agent.md`, `.github/agents/frontend.agent.md`, `.github/agents/websocket.agent.md`.

## Hành vi mong muốn
- Tách rõ ràng: `frontend/src/` cho UI và client logic, `backend/src/` cho server, route, service, repository.
- Duy trì module/domain: `document`, `auth`, `user`, và socket collaboration.
- Đồng bộ tên sự kiện socket giữa backend và frontend.
- Thay đổi cục bộ, tránh ảnh hưởng lan rộng tới phần không liên quan.
- Ưu tiên code rõ ràng, dễ duy trì, không thêm cấu trúc mới nếu không cần.
