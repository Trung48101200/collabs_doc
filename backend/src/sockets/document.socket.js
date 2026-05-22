const activeUsersByDocument = new Map();

function getRoom(documentId) {
  return `document:${documentId}`;
}

function getUsers(documentId) {
  return Array.from(activeUsersByDocument.get(String(documentId))?.values() || []);
}

function addUser(documentId, socketId, user) {
  const key = String(documentId);
  if (!activeUsersByDocument.has(key)) activeUsersByDocument.set(key, new Map());
  activeUsersByDocument.get(key).set(socketId, user);
}

function removeUser(documentId, socketId) {
  const key = String(documentId);
  const users = activeUsersByDocument.get(key);
  if (!users) return;
  users.delete(socketId);
  if (users.size === 0) activeUsersByDocument.delete(key);
}

export function registerDocumentSocket(io) {
  io.on("connection", (socket) => {
    socket.data.joinedDocuments = new Set();

    socket.on("join-document", ({ documentId, user }) => {
      socket.join(getRoom(documentId));
      socket.data.joinedDocuments.add(String(documentId));
      addUser(documentId, socket.id, {
        id: user?.id,
        name: user?.name || "Anonymous",
        color: user?.color || "#2f80ed"
      });

      io.to(getRoom(documentId)).emit("user-list", {
        documentId,
        users: getUsers(documentId)
      });
    });

    socket.on("yjs-update", ({ documentId, userId, update, clientId }) => {
      socket.to(getRoom(documentId)).emit("yjs-update", {
        documentId,
        userId,
        update,
        clientId
      });
    });

    socket.on("awareness-update", ({ documentId, awareness }) => {
      socket.to(getRoom(documentId)).emit("awareness-update", awareness);
    });

    socket.on("cursor-update", ({ documentId, userId, cursor }) => {
      socket.to(getRoom(documentId)).emit("cursor-update", { userId, cursor });
    });

    socket.on("save-document", ({ documentId, version, savedAt }) => {
      io.to(getRoom(documentId)).emit("document-saved", {
        documentId,
        version,
        savedAt: savedAt || new Date().toISOString()
      });
    });

    socket.on("leave-document", ({ documentId }) => {
      socket.leave(getRoom(documentId));
      socket.data.joinedDocuments.delete(String(documentId));
      removeUser(documentId, socket.id);
      io.to(getRoom(documentId)).emit("user-list", {
        documentId,
        users: getUsers(documentId)
      });
    });

    socket.on("disconnect", () => {
      for (const documentId of socket.data.joinedDocuments) {
        removeUser(documentId, socket.id);
        io.to(getRoom(documentId)).emit("user-list", {
          documentId,
          users: getUsers(documentId)
        });
      }
    });
  });
}
