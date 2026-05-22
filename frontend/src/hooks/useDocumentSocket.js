import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { createDocumentSocket } from "../sockets/documentSocket.js";
import { applyUpdateArray } from "../utils/yjsEncoding.js";

export function useDocumentSocket(documentId, user) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionState, setConnectionState] = useState("connecting");

  const ydoc = useMemo(() => new Y.Doc(), [documentId]);
  const socket = useMemo(() => createDocumentSocket(), [documentId]);

  useEffect(() => {
    const persistence = new IndexeddbPersistence(`document-${documentId}`, ydoc);

    socket.on("connect", () => {
      setConnectionState("online");
      socket.emit("join-document", {
        documentId,
        user
      });
    });

    socket.on("disconnect", () => {
      setConnectionState("offline");
    });

    socket.on("user-list", ({ users }) => {
      setOnlineUsers(users || []);
    });

    socket.on("yjs-update", ({ update }) => {
      if (update) applyUpdateArray(ydoc, update);
    });

    const handleUpdate = (update, origin) => {
      if (origin === "remote") return;
      socket.emit("yjs-update", {
        documentId,
        userId: user.id,
        update: Array.from(update),
        clientId: socket.id
      });
    };

    ydoc.on("update", handleUpdate);

    return () => {
      socket.emit("leave-document", { documentId, userId: user.id });
      socket.disconnect();
      ydoc.off("update", handleUpdate);
      persistence.destroy();
      ydoc.destroy();
    };
  }, [documentId, socket, user, ydoc]);

  return {
    socket,
    ydoc,
    onlineUsers,
    connectionState
  };
}
