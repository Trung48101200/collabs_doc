import { useCallback, useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { IndexeddbPersistence } from "y-indexeddb";
import { createSocketClient } from "../socket/socketClient";
import { SocketEvents } from "../socket/socketEvents";
import { registerDocumentSocketHandlers } from "../socket/socketHandlers";
import {
  applyAwarenessUpdateBytes,
  applyUpdateArray,
  encodeAwarenessUpdate,
  encodeStateAsBase64
} from "../utils/yjsEncoding";
import type { DocumentRole, User } from "../types";

interface UseDocumentSocketResult {
  ydoc: Y.Doc;
  awareness: Awareness;
  connectionState: "connecting" | "online" | "offline";
  onlineUsers: User[];
  sendSaveRequest: () => void;
  sendVersionRequest: () => void;
  sendReconnectSync: () => void;
}

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

export function useDocumentSocket(documentId: number, user: User, role: DocumentRole): UseDocumentSocketResult {
  const [connectionState, setConnectionState] = useState<"connecting" | "online" | "offline">(useMocks ? "offline" : "connecting");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([user]);
  const [socketError, setSocketError] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), [documentId]);
  const awareness = useMemo(() => new Awareness(ydoc), [ydoc]);
  const socket = useMemo(() => createSocketClient(), [documentId]);

  useEffect(() => {
    const persistence = new IndexeddbPersistence(`document-${documentId}`, ydoc);

    if (useMocks || socketError) {
      // In mock mode or socket error, just use local Yjs + IndexedDB without socket
      awareness.setLocalStateField("user", {
        id: user.id,
        name: user.name,
        color: user.color
      });
      return () => {
        persistence.destroy();
        ydoc.destroy();
      };
    }

    try {
      const cleanupSocket = registerDocumentSocketHandlers(socket, ydoc, awareness, {
        onConnect: () => {
          setConnectionState("online");
          setSocketError(false);
          socket.emit(SocketEvents.JoinDocument, { documentId, user });
          socket.emit(SocketEvents.ReconnectSync, {
            documentId,
            ydocState: encodeStateAsBase64(ydoc),
            clientId: socket.id
          });
        },
        onDisconnect: () => {
          setConnectionState("offline");
        },
        onUserList: (users) => {
          setOnlineUsers(users);
        },
        onRemoteUpdate: (update) => {
          applyUpdateArray(ydoc, Array.from(update));
        },
        onAwarenessUpdate: (update) => {
          applyAwarenessUpdateBytes(awareness, Array.from(update));
        }
      });

      // Error handlers
      const handleConnectError = (error: any) => {
        console.error("Socket connection error:", error);
        setSocketError(true);
        setConnectionState("offline");
      };

      const handleError = (error: any) => {
        console.error("Socket error:", error);
        setSocketError(true);
      };

      socket.on("connect_error", handleConnectError);
      socket.on("error", handleError);

      const handleLocalUpdate = (update: Uint8Array, origin: unknown) => {
        if (origin === "remote") return;
        if (role === "viewer") return;

        try {
          socket.emit(SocketEvents.YjsUpdate, {
            documentId,
            userId: user.id,
            update: Array.from(update),
            clientId: socket.id
          });
        } catch (err) {
          console.error("Failed to emit Yjs update:", err);
        }
      };

      ydoc.on("update", handleLocalUpdate);

      awareness.setLocalStateField("user", {
        id: user.id,
        name: user.name,
        color: user.color
      });

      const awarenessListener = ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
        const changedClients = [...added, ...updated, ...removed];
        if (changedClients.length === 0) return;
        const update = encodeAwarenessUpdate(awareness, changedClients);

        try {
          socket.emit(SocketEvents.AwarenessUpdate, {
            documentId,
            update,
            clientId: socket.id
          });
        } catch (err) {
          console.error("Failed to emit awareness update:", err);
        }
      };

      awareness.on("update", awarenessListener);

      return () => {
        socket.removeListener("connect_error", handleConnectError);
        socket.removeListener("error", handleError);
        socket.emit(SocketEvents.LeaveDocument, { documentId, userId: user.id });
        ydoc.off("update", handleLocalUpdate);
        awareness.off("update", awarenessListener);
        cleanupSocket();
        socket.disconnect();
        persistence.destroy();
        ydoc.destroy();
      };
    } catch (err) {
      console.error("Socket initialization error:", err);
      setSocketError(true);
      setConnectionState("offline");
      return () => {
        persistence.destroy();
        ydoc.destroy();
      };
    }
  }, [documentId, socket, user, ydoc, awareness, role, socketError]);

  const sendSaveRequest = useCallback(() => {
    if (useMocks || socketError || !socket.connected) return;
    try {
      socket.emit(SocketEvents.SaveDocument, { documentId, userId: user.id });
    } catch (err) {
      console.error("Failed to send save request:", err);
    }
  }, [documentId, socket, user.id, socketError]);

  const sendVersionRequest = useCallback(() => {
    if (useMocks || socketError || !socket.connected) return;
    try {
      socket.emit(SocketEvents.CreateVersion, { documentId, userId: user.id });
    } catch (err) {
      console.error("Failed to send version request:", err);
    }
  }, [documentId, socket, user.id, socketError]);

  const sendReconnectSync = useCallback(() => {
    if (useMocks || socketError || !socket.connected) return;
    try {
      socket.emit(SocketEvents.ReconnectSync, {
        documentId,
        ydocState: encodeStateAsBase64(ydoc),
        clientId: socket.id
      });
    } catch (err) {
      console.error("Failed to send reconnect sync:", err);
    }
  }, [documentId, socket, ydoc, socketError]);

  return {
    ydoc,
    awareness,
    connectionState,
    onlineUsers,
    sendSaveRequest,
    sendVersionRequest,
    sendReconnectSync
  };
}
