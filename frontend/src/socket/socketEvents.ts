export const SocketEvents = {
  JoinDocument: "join-document",
  LeaveDocument: "leave-document",
  YjsUpdate: "yjs-update",
  AwarenessUpdate: "awareness-update",
  CursorUpdate: "cursor-update",
  SelectionUpdate: "selection-update",
  SaveDocument: "save-document",
  CreateVersion: "create-version",
  ReconnectSync: "reconnect-sync",
  UserList: "user-list"
} as const;
