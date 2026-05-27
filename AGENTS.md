# Project Overview

Collaborative Realtime Document Editor is a Google Docs–style system for rich-text document creation and real-time collaboration.

- Frontend: React + TipTap
- Realtime: Yjs + Socket.IO
- Backend: Node.js + Express
- Database: MySQL

Core capabilities:
- collaborative editing
- user awareness and remote cursors
- autosave
- undo/redo and offline editing
- versioning
- reconnect sync
- owner/editor/viewer permissions

Realtime design:
- CRDT powered by Yjs
- incremental Yjs updates only
- never send full document state over Socket.IO

# Current Project Structure

.github/
- `agents/`: AI role definitions and domain guidance
- `skills/`: reusable knowledge modules
- `instructions/`: project truth and implementation docs
- `workflows/`: developer workflow guidance

frontend/
- React app, TipTap editor, collaboration provider, socket client

backend/
- Express API, Socket.IO server, Sequelize models, MySQL persistence

docs/
- project design, API docs, database notes, websocket contracts

# High Level Architecture

User
↓
React + TipTap
↓
Yjs
↓
Socket.IO
↓
Node + Express
↓
MySQL

- TipTap renders rich text and drives editor state.
- Yjs manages CRDT collaboration locally.
- Socket.IO transmits incremental updates and awareness events.
- Backend persists document snapshots and Yjs state in MySQL.

# Read Order

1. `.github/copilot-instructions.md`
2. `.github/instructions/project-context.md`
3. `.github/instructions/architecture.md`
4. `.github/instructions/coding-rules.md`
5. relevant agent file
6. relevant workflow file
7. relevant skill file

# Agent Routing

- Frontend: `.github/agents/frontend.agent.md`
- Backend: `.github/agents/backend.agent.md`
- Database: `.github/agents/database.agent.md`
- Realtime: `.github/agents/websocket.agent.md`
- Review: `.github/agents/reviewer-agent.md`

# Skills

- TipTap: `.github/skills/tiptap-skill.md`
- Yjs: `.github/skills/yjs-skill.md`
- Socket.IO: `.github/skills/socketio-skill.md`
- Offline sync: `.github/skills/offline-sync-skill.md`
- Permission: `.github/skills/permission-skill.md`

# Workflows

- Feature: `.github/workflows/feature-workflow.md`
- Bugfix: `.github/workflows/bugfix-workflow.md`
- Realtime: `.github/workflows/realtime-workflow.md`
- Versioning: `.github/workflows/versioning-workflow.md`

# Development Workflow

1. identify task as frontend / backend / realtime
2. choose relevant agent
3. read workflow guidance
4. read related skills
5. locate existing code
6. reuse existing components and modules
7. implement changes
8. test locally

# Mandatory Rules

- never rewrite architecture
- never duplicate code
- never bypass service layer
- never send full document through websocket
- use Yjs incremental updates only
- permission check before updates
- read existing implementation before coding
- prefer reusable components
- minimize file changes
