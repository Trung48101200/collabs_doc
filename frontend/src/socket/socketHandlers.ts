import type { Socket } from "socket.io-client";
import * as Y from "yjs";
import { applyUpdateArray } from "../utils/yjsEncoding";
import { SocketEvents } from "./socketEvents";
import type { User } from "../types";
import { Awareness } from "y-protocols/awareness";
import { applyAwarenessUpdate } from "y-protocols/awareness";

export interface DocumentSocketHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onUserList?: (users: User[]) => void;
  onRemoteUpdate?: (update: Uint8Array) => void;
  onAwarenessUpdate?: (update: Uint8Array) => void;
  onCursorUpdate?: (payload: { userId: number; cursor: { from: number; to: number } }) => void;
  onSyncStateResponse?: (update: Uint8Array) => void;
  onVersionRestored?: (ydocState: string) => void;
  onAccessDenied?: (payload: { documentId?: number; message?: string }) => void;
}

export function registerDocumentSocketHandlers(
  socket: Socket,
  ydoc: Y.Doc,
  awareness: Awareness,
  handlers: DocumentSocketHandlers
) {
  socket.on("connect", () => handlers.onConnect?.());
  socket.on("disconnect", () => handlers.onDisconnect?.());
  socket.on(SocketEvents.UserList, ({ users }) => handlers.onUserList?.(users || []));
  socket.on(SocketEvents.YjsUpdate, ({ update }) => {
    if (update) handlers.onRemoteUpdate?.(Uint8Array.from(update));
  });
  socket.on(SocketEvents.AwarenessUpdate, (awarenessData) => {
    // If backend sends awareness object directly
    if (awarenessData) handlers.onAwarenessUpdate?.(Uint8Array.from(awarenessData));
  });
  socket.on(SocketEvents.CursorUpdate, ({ userId, cursor }) => {
    if (userId && cursor) handlers.onCursorUpdate?.({ userId, cursor });
  });
  socket.on(SocketEvents.SyncStateResponse, ({ update }) => {
    if (update) handlers.onSyncStateResponse?.(Uint8Array.from(update));
  });
  socket.on(SocketEvents.VersionRestored, ({ ydocState }) => {
    if (ydocState) handlers.onVersionRestored?.(ydocState);
  });
  socket.on(SocketEvents.AccessDenied, (payload) => handlers.onAccessDenied?.(payload || {}));

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off(SocketEvents.UserList);
    socket.off(SocketEvents.YjsUpdate);
    socket.off(SocketEvents.AwarenessUpdate);
    socket.off(SocketEvents.CursorUpdate);
    socket.off(SocketEvents.SyncStateResponse);
    socket.off(SocketEvents.VersionRestored);
    socket.off(SocketEvents.AccessDenied);
  };
}
