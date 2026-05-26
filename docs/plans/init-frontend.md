Bạn là senior frontend architect.

Xây dựng frontend hoàn chỉnh cho hệ thống soạn thảo văn bản cộng tác realtime tương tự Google Docs.

Đọc và tuân thủ:

.github/agents/code.agent.md
.github/agents/architecture.md
.github/agents/coding-rules.md
.github/agents/frontend.agent.md
frontend/README.md

Không viết code trước khi phân tích kiến trúc.

========================

MÔ TẢ HỆ THỐNG

Đây là collaborative document editor.

Nhiều người có thể:

- cùng chỉnh sửa tài liệu realtime
- thấy cursor của nhau
- thấy user online
- undo redo
- tạo version
- restore version
- offline editing
- reconnect sync
- phân quyền owner/editor/viewer

Realtime dùng:

Yjs + Socket.IO

Editor:

TipTap

KHÔNG gửi toàn bộ document khi gõ.

Chỉ gửi incremental Yjs updates.

========================

STACK

React
TypeScript
Tailwind
TipTap
Yjs
Socket.IO-client

Có thể dùng:

React Query
Zustand
Context API

========================

CẤU TRÚC FRONTEND

Tạo:

src/

app/

components/

editor/

hooks/

services/

socket/

contexts/

types/

utils/

Giải thích trách nhiệm từng thư mục.

========================

EDITOR MODULE

editor/

Toolbar

EditorWrapper

CollaborationProvider

CursorLayer

VersionPanel

EditorStatus

EditorPermissionGuard

Yêu cầu:

Editor logic phải nằm trong editor module.

Không đặt logic editor trong page.

========================

FLOW KHI MỞ DOCUMENT

Document page load

↓

GET /api/documents/:id

↓

load:

contentText
contentJson
contentHtml

↓

khởi tạo:

new Y.Doc()

↓

khởi tạo provider

↓

socket.emit(
"join-document"
)

↓

sync state

↓

TipTap render

↓

listen realtime updates

Mô tả và code theo flow này.

========================

SOCKET MODULE

socket/

socketClient.ts

socketEvents.ts

socketHandlers.ts

Quy tắc:

component UI không emit socket

chỉ socket layer xử lý socket

event:

join-document

leave-document

yjs-update

awareness-update

cursor-update

selection-update

save-document

create-version

reconnect-sync

========================

TIPTAP

Extensions:

StarterKit

Collaboration

CollaborationCursor

Underline

TextAlign

Link

TextStyle

Color

Highlight

Toolbar cần:

bold
italic
underline
heading
align
bullet list
number list
link
color
highlight

========================

PERMISSION

owner

editor

viewer

viewer:

- khóa editor
- ẩn toolbar
- không gửi update

backend vẫn kiểm tra quyền

frontend chỉ hỗ trợ UI

========================

AUTOSAVE

5–10 giây:

editor.getText()

editor.getJSON()

editor.getHTML()

encodeStateAsBase64(ydoc)

gửi API save

========================

OFFLINE

mất mạng:

- hiển thị offline
- vẫn chỉnh sửa local

IndexedDB lưu local state

khi reconnect:

join room

gửi pending updates

sync lại

========================

CUSTOM HOOKS

Tạo:

useEditorSync()

useCollaborators()

useDocument()

useSocket()

useAutosave()

useConnectionStatus()

usePermission()

========================

QUY TẮC

không fetch trong component

không emit socket trong UI

không prop drilling

component tái sử dụng

loading skeleton

error boundary

typescript interface

optional chaining

function nhỏ

không duplicate code

========================

ĐẦU RA

Bước 1:

phân tích kiến trúc

Bước 2:

đề xuất folder tree

Bước 3:

sinh types

Bước 4:

sinh services

Bước 5:

sinh hooks

Bước 6:

sinh editor module

Bước 7:

sinh page

Bước 8:

giải thích luồng hoạt động

Không code toàn bộ trong một file.