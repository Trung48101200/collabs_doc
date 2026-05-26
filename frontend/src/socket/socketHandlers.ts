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
  socket.on(SocketEvents.AwarenessUpdate, ({ update }) => {
    if (update) handlers.onAwarenessUpdate?.(Uint8Array.from(update));
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off(SocketEvents.UserList);
    socket.off(SocketEvents.YjsUpdate);
    socket.off(SocketEvents.AwarenessUpdate);
  };
}
