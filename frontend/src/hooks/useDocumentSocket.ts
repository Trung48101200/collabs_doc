import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { IndexeddbPersistence } from "y-indexeddb";
import { createSocketClient } from "../socket/socketClient";
import { SocketEvents } from "../socket/socketEvents";
import { registerDocumentSocketHandlers } from "../socket/socketHandlers";
import {
  applyAwarenessUpdateBytes,
  decodeBase64ToUint8Array,
  encodeAwarenessUpdate
} from "../utils/yjsEncoding";
import type { DocumentRole, User } from "../types";
import { getDocument } from "../services/documentApi";

interface UseDocumentSocketResult {
  ydoc: Y.Doc;
  awareness: Awareness;
  connectionState: "connecting" | "online" | "offline";
  onlineUsers: User[];
  remoteCursors: Record<number, { from: number; to: number }>;
  writeBlocked: boolean;
  sendCursorUpdate: (cursor: { from: number; to: number }) => void;
  sendSaveRequest: () => void;
  sendVersionRequest: () => void;
  sendSyncRequest: () => void;
  applyYdocState: (ydocState: string) => void;
}

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";
const SESSION_UPDATED_EVENT = "collab-doc-session-updated";
const SESSION_EXPIRED_EVENT = "collab-doc-session-expired";
const STORAGE_KEY = "collab-doc-user";
const API_URL = import.meta.env.VITE_API_URL || "http://backend:4000";

export function useDocumentSocket(documentId: number, user: User, role: DocumentRole, initialYdocState?: string): UseDocumentSocketResult {
  const [connectionState, setConnectionState] = useState<"connecting" | "online" | "offline">(useMocks ? "offline" : "connecting");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([user]);
  const [remoteCursors, setRemoteCursors] = useState<Record<number, { from: number; to: number }>>({});
  const [writeBlocked, setWriteBlocked] = useState(false);
  const writeBlockedRef = useRef(false);
  const pendingUpdatesRef = useRef<Uint8Array[]>([]);
  const initialStateAppliedRef = useRef(false);
  const authRefreshInFlightRef = useRef(false);

  const ydoc = useMemo(() => {
    const doc = new Y.Doc();
    return doc;
  }, [documentId]);
  const awareness = useMemo(() => new Awareness(ydoc), [ydoc]);
  const socket = useMemo(() => createSocketClient(user.token), [documentId, user.token]);

  useEffect(() => {
    initialStateAppliedRef.current = false;
  }, [documentId]);

  useEffect(() => {
    if (initialStateAppliedRef.current) return;
    if (!initialYdocState) return;
    try {
      const update = decodeBase64ToUint8Array(initialYdocState);
      Y.applyUpdate(ydoc, update, "remote");
      initialStateAppliedRef.current = true;
    } catch (err) {
      console.error("Failed to apply initial ydoc state:", err);
    }
  }, [initialYdocState, ydoc]);

  useEffect(() => {
    return () => {
      ydoc.destroy();
      awareness.destroy();
      socket.disconnect();
    };
  }, [ydoc, awareness, socket]);

  useEffect(() => {
    const persistence = new IndexeddbPersistence(`document-${documentId}`, ydoc);
    let persistenceReady = false;
    let cancelled = false;
    const connectSocketIfNeeded = () => {
      if (useMocks || cancelled || socket.connected || socket.active) return;
      socket.connect();
    };

    const requestServerSync = () => {
      if (cancelled || useMocks || !persistenceReady || !socket.connected) return;
      try {
        const stateVector = Y.encodeStateVector(ydoc);
        socket.emit(SocketEvents.SyncStateRequest, {
          documentId,
          stateVector: Array.from(stateVector)
        });
      } catch (err) {
        console.error("Failed to send sync request:", err);
      }
    };

    persistence.whenSynced.then(() => {
      if (cancelled) return;
      persistenceReady = true;
      requestServerSync();
    });

    awareness.setLocalStateField("user", {
      id: user.id,
      name: user.name,
      color: user.color
    });

    if (useMocks) {
      return () => {
        cancelled = true;
        persistence.destroy();
      };
    }

    try {
      const emitYjsUpdate = (update: Uint8Array) => {
        socket.emit(SocketEvents.YjsUpdate, {
          documentId,
          userId: user.id,
          update: Array.from(update),
          clientId: socket.id
        });
      };

      const flushPendingUpdates = () => {
        if (!socket.connected || pendingUpdatesRef.current.length === 0) return;
        const mergedUpdate = Y.mergeUpdates(pendingUpdatesRef.current);
        pendingUpdatesRef.current = [];
        emitYjsUpdate(mergedUpdate);
      };

      const handleSocketConnected = () => {
        setConnectionState("online");
        socket.emit(SocketEvents.JoinDocument, {
          documentId,
          user: { id: user.id, name: user.name, color: user.color }
        });
        flushPendingUpdates();
        requestServerSync();
      };

      const cleanupSocket = registerDocumentSocketHandlers(socket, ydoc, awareness, {
        onConnect: () => {
          handleSocketConnected();
        },
        onDisconnect: () => {
          setConnectionState("offline");
        },
        onUserList: (users) => {
          setOnlineUsers(users);
          const ids = new Set(users.map((item) => item.id));
          setRemoteCursors((prev) => {
            const next: Record<number, { from: number; to: number }> = {};
            for (const [key, value] of Object.entries(prev)) {
              if (ids.has(Number(key))) next[Number(key)] = value;
            }
            return next;
          });
        },
        onRemoteUpdate: (update) => {
          Y.applyUpdate(ydoc, update, "remote");
        },
        onAwarenessUpdate: (update) => {
          applyAwarenessUpdateBytes(awareness, Array.from(update));
        },
        onCursorUpdate: ({ userId, cursor }) => {
          if (!userId || userId === user.id) return;
          if (!cursor || typeof cursor.from !== "number" || typeof cursor.to !== "number") return;
          setRemoteCursors((prev) => ({
            ...prev,
            [userId]: { from: cursor.from, to: cursor.to }
          }));
        },
        onSyncStateResponse: (update) => {
          if (update) {
            console.log("[restore] sync-state-response received", {
              documentId,
              bytes: update.length
            });
            Y.applyUpdate(ydoc, update, "remote");
          } else {
            console.warn("[restore] sync-state-response empty update", { documentId });
          }
        },
        onVersionRestored: (ydocState) => {
          if (ydocState) {
            const update = decodeBase64ToUint8Array(ydocState);
            resetYdocState(update);
          } else {
            console.warn("[restore] version-restored missing ydocState", { documentId });
          }
        },
        onAccessDenied: ({ message }) => {
          const normalized = String(message || "").toLowerCase();
          if (normalized.includes("edit") || normalized.includes("viewer")) {
            writeBlockedRef.current = true;
            setWriteBlocked(true);
            return;
          }
          setConnectionState("offline");
        }
      });

      const handleConnectError = (error: unknown) => {
        console.error("Socket connection error:", error);
        const message = String((error as { message?: string })?.message || "").toLowerCase();
        if (message.includes("authentication error")) {
          if (authRefreshInFlightRef.current) {
            setConnectionState("offline");
            return;
          }
          const raw = localStorage.getItem(STORAGE_KEY);
          const savedUser = raw ? (JSON.parse(raw) as User) : null;
          if (savedUser?.refreshToken) {
            authRefreshInFlightRef.current = true;
            fetch(`${API_URL}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: savedUser.refreshToken })
            })
              .then(async (response) => {
                if (!response.ok) throw new Error("refresh failed");
                const data = await response.json();
                const token = data?.accessToken || data?.token;
                if (!token) throw new Error("missing access token");
                const updatedUser = { ...savedUser, token };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
                window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT, { detail: updatedUser }));
                socket.auth = { token };
                connectSocketIfNeeded();
              })
              .catch(() => {
                window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
              })
              .finally(() => {
                authRefreshInFlightRef.current = false;
              });
            return;
          }
          window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
          return;
        }
        setConnectionState("offline");
      };

      const handleError = (error: unknown) => {
        console.error("Socket error:", error);
        setConnectionState("offline");
      };

      socket.on("connect_error", handleConnectError);
      socket.on("error", handleError);

      const handleSessionUpdated = (event: Event) => {
        const nextUser = (event as CustomEvent<User>).detail;
        const nextToken = nextUser?.token;
        if (!nextToken) return;
        socket.auth = { token: nextToken };
        connectSocketIfNeeded();
      };

      const handleSessionExpired = () => {
        if (socket.connected) {
          socket.disconnect();
        }
        setConnectionState("offline");
      };

      window.addEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
      window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      if (socket.connected) {
        handleSocketConnected();
      } else {
        connectSocketIfNeeded();
      }

      const handleLocalUpdate = (update: Uint8Array, origin: unknown) => {
        if (origin === "remote") return;
        if (role === "viewer" || writeBlockedRef.current) return;
        if (!socket.connected) {
          pendingUpdatesRef.current.push(update);
          return;
        }

        try {
          emitYjsUpdate(update);
        } catch (err) {
          console.error("Failed to emit Yjs update:", err);
          pendingUpdatesRef.current.push(update);
        }
      };

      const resetYdocState = (update: Uint8Array) => {
        try {
          // Restore must replace current document state, not merge.
          // Yjs updates are monotonic, so applying an older snapshot alone
          // won't remove newer content unless we clear the fragment first.
          ydoc.transact(() => {
            const fragment = ydoc.getXmlFragment("default");
            fragment.delete(0, fragment.length);
          }, "remote");
          Y.applyUpdate(ydoc, update, "remote");
        } catch (err) {
          console.error("Failed to reset Yjs document state:", err);
        }
      };

      ydoc.on("update", handleLocalUpdate);

      const awarenessListener = ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
        if (origin === "remote") return;
        const changedClients = [...added, ...updated, ...removed];
        if (changedClients.length === 0 || !socket.connected) return;
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
        cancelled = true;
        socket.removeListener("connect_error", handleConnectError);
        socket.removeListener("error", handleError);
        window.removeEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
        window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
        socket.emit(SocketEvents.LeaveDocument, { documentId, userId: user.id });
        ydoc.off("update", handleLocalUpdate);
        awareness.off("update", awarenessListener);
        cleanupSocket();
        persistence.destroy();
      };
    } catch (err) {
      console.error("Socket initialization error:", err);
      setConnectionState("offline");
      return () => {
        cancelled = true;
        persistence.destroy();
      };
    }
  }, [documentId, socket, user.id, user.name, user.color, role, ydoc, awareness]);

  const sendSaveRequest = useCallback(() => {
    if (useMocks || !socket.connected) return;
    try {
      socket.emit(SocketEvents.SaveDocument, { documentId, userId: user.id });
    } catch (err) {
      console.error("Failed to send save request:", err);
    }
  }, [documentId, socket, user.id]);

  const sendCursorUpdate = useCallback((cursor: { from: number; to: number }) => {
    if (useMocks || !socket.connected) return;
    try {
      socket.emit(SocketEvents.CursorUpdate, {
        documentId,
        userId: user.id,
        cursor
      });
    } catch (err) {
      console.error("Failed to send cursor update:", err);
    }
  }, [documentId, socket, user.id]);

  const sendVersionRequest = useCallback(() => {
    if (useMocks || !socket.connected) return;
    try {
      socket.emit(SocketEvents.CreateVersion, { documentId, userId: user.id });
    } catch (err) {
      console.error("Failed to send version request:", err);
    }
  }, [documentId, socket, user.id]);

  const sendSyncRequest = useCallback(() => {
    if (useMocks || !socket.connected) return;
    try {
      const stateVector = Y.encodeStateVector(ydoc);
      console.log("[restore] sendSyncRequest", {
        documentId,
        stateVectorBytes: stateVector.length
      });
      socket.emit(SocketEvents.SyncStateRequest, {
        documentId,
        stateVector: Array.from(stateVector)
      });
    } catch (err) {
      console.error("Failed to send sync request:", err);
    }
  }, [documentId, socket, ydoc]);

  const applyYdocState = useCallback((ydocState: string) => {
    if (!ydocState) return;
    try {
      console.log("[restore] applyYdocState", {
        documentId,
        base64Length: ydocState.length
      });
      const update = decodeBase64ToUint8Array(ydocState);
      ydoc.transact(() => {
        const fragment = ydoc.getXmlFragment("default");
        fragment.delete(0, fragment.length);
      }, "remote");
      Y.applyUpdate(ydoc, update, "remote");
      console.log("[restore] applyYdocState done", {
        documentId,
        updateBytes: update.length
      });
    } catch (err) {
      console.error("Failed to apply restored ydoc state:", err);
    }
  }, [documentId, ydoc]);

  return useMemo(() => ({
    ydoc,
    awareness,
    connectionState,
    onlineUsers,
    remoteCursors,
    writeBlocked,
    sendCursorUpdate,
    sendSaveRequest,
    sendVersionRequest,
    sendSyncRequest,
    applyYdocState
  }), [ydoc, awareness, connectionState, onlineUsers, remoteCursors, writeBlocked, sendCursorUpdate, sendSaveRequest, sendVersionRequest, sendSyncRequest, applyYdocState]);
}
