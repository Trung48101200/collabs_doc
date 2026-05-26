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
  decodeBase64ToUint8Array,
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
  sendSyncRequest: () => void;
}

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

export function useDocumentSocket(documentId: number, user: User, role: DocumentRole): UseDocumentSocketResult {
  const [connectionState, setConnectionState] = useState<"connecting" | "online" | "offline">(useMocks ? "offline" : "connecting");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([user]);
  const [socketError, setSocketError] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), [documentId]);
  const awareness = useMemo(() => new Awareness(ydoc), [ydoc]);
  const socket = useMemo(() => createSocketClient(), [documentId]);

  // Handle destruction separately to avoid destroying active instances on socket error re-runs
  useEffect(() => {
    return () => {
      ydoc.destroy();
      awareness.destroy();
      socket.disconnect();
    };
  }, [ydoc, awareness, socket]);

  useEffect(() => {
    const persistence = new IndexeddbPersistence(`document-${documentId}`, ydoc);

    if (useMocks || socketError) {
      awareness.setLocalStateField("user", {
        id: user.id,
        name: user.name,
        color: user.color
      });
      return () => {
        persistence.destroy();
      };
    }

    try {
      const cleanupSocket = registerDocumentSocketHandlers(socket, ydoc, awareness, {
        onConnect: () => {
          setConnectionState("online");
          setSocketError(false);
          socket.emit(SocketEvents.JoinDocument, { documentId, user });
          
          const stateVector = Y.encodeStateVector(ydoc);
          socket.emit(SocketEvents.SyncStateRequest, {
            documentId,
            stateVector: Array.from(stateVector)
          });
        },
        onDisconnect: () => {
          setConnectionState("offline");
        },
        onUserList: (users) => {
          setOnlineUsers(users);
        },
        onRemoteUpdate: (update) => {
          Y.applyUpdate(ydoc, update, "remote");
        },
        onAwarenessUpdate: (update) => {
          applyAwarenessUpdateBytes(awareness, Array.from(update));
        },
        onSyncStateResponse: (update) => {
          if (update) {
            Y.applyUpdate(ydoc, update, "remote");
          }
        },
        onVersionRestored: (ydocState) => {
          if (ydocState) {
            const update = decodeBase64ToUint8Array(ydocState);
            Y.applyUpdate(ydoc, update, "remote");
          }
        }
      });

      const handleConnectError = (error: any) => {
        console.error("Socket connection error:", error);
        if (String(error?.message || "").toLowerCase().includes("authentication error")) {
          localStorage.removeItem("collab-doc-user");
          window.dispatchEvent(new Event("collab-doc-session-expired"));
        }
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

      const awarenessListener = ({ added, updated, removed }: any, origin: any) => {
        if (origin === "remote") return;
        const changedClients = [...added, ...updated, ...removed];
        if (changedClients.length === 0) return;
        const awarenessUpdate = encodeAwarenessUpdate(awareness, changedClients);

        try {
          socket.emit(SocketEvents.AwarenessUpdate, {
            documentId,
            awareness: awarenessUpdate
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
        persistence.destroy();
      };
    } catch (err) {
      console.error("Socket initialization error:", err);
      setSocketError(true);
      setConnectionState("offline");
      return () => {
        persistence.destroy();
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

  const sendSyncRequest = useCallback(() => {
    if (useMocks || socketError || !socket.connected) return;
    try {
      const stateVector = Y.encodeStateVector(ydoc);
      socket.emit(SocketEvents.SyncStateRequest, {
        documentId,
        stateVector: Array.from(stateVector)
      });
    } catch (err) {
      console.error("Failed to send sync request:", err);
    }
  }, [documentId, socket, ydoc, socketError]);

  return useMemo(() => ({
    ydoc,
    awareness,
    connectionState,
    onlineUsers,
    sendSaveRequest,
    sendVersionRequest,
    sendSyncRequest
  }), [ydoc, awareness, connectionState, onlineUsers, sendSaveRequest, sendVersionRequest, sendSyncRequest]);
}
