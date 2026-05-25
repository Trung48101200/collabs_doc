import jwt from "jsonwebtoken";
import * as Y from "yjs";
import { documentService } from "../modules/document/document.service.js";
import { tokenRepository } from "../modules/auth/token.repository.js";

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
  // 1. Authenticate Socket.IO connections with JWT
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication error. Token required."));
    }
    
    try {
      const isBlacklisted = await tokenRepository.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return next(new Error("Authentication error. Invalid or expired token."));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "admin-collab-docs-super-secret-key-2026");
      socket.data.user = {
        id: Number(decoded.id),
        email: decoded.email,
        name: decoded.name
      };
      socket.data.joinedDocuments = new Set();
      socket.data.roles = new Map(); // Cache roles in-memory for fast lookup
      next();
    } catch (err) {
      return next(new Error("Authentication error. Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    // 2. Client requests to join a document room
    socket.on("join-document", async ({ documentId, user }) => {
      try {
        const userId = socket.data.user.id;
        
        // Query database to check if user has access
        const role = await documentService.assertCanRead(documentId, userId);
        if (!role) {
          socket.emit("access-denied", {
            documentId,
            message: "You do not have access to this document"
          });
          return;
        }

        // Cache role in-memory for this connection session
        socket.data.roles.set(String(documentId), role);

        socket.join(getRoom(documentId));
        socket.data.joinedDocuments.add(String(documentId));
        
        addUser(documentId, socket.id, {
          id: userId,
          name: socket.data.user.name || user?.name || "Anonymous",
          color: user?.color || "#2f80ed",
          role: role
        });

        // Broadcast user list to the room
        io.to(getRoom(documentId)).emit("user-list", {
          documentId,
          users: getUsers(documentId)
        });
      } catch (error) {
        console.error("Error joining document room:", error);
        socket.emit("error", { message: "Failed to join document" });
      }
    });

    // 3. Handle collaborative editing updates (Yjs Updates)
    socket.on("yjs-update", async ({ documentId, userId, update, clientId }) => {
      try {
        // Read role from in-memory cache
        let role = socket.data.roles.get(String(documentId));
        
        // DB Fallback if role is not cached
        if (!role) {
          role = await documentService.assertCanRead(documentId, socket.data.user.id);
          if (role) {
            socket.data.roles.set(String(documentId), role);
          }
        }

        // Only owner and editor can write/update document
        if (!role || !["owner", "editor"].includes(role)) {
          socket.emit("access-denied", {
            documentId,
            message: "Viewer cannot edit this document"
          });
          return;
        }

        // PERSISTENCE: Save update and merge Yjs state in DB
        await documentService.acceptRealtimeUpdate({
          documentId,
          userId: socket.data.user.id,
          update,
          clientId
        });

        console.log(`[yjs-update] Received Yjs update from userId: ${socket.data.user.id}, socket: ${socket.id} for documentId: ${documentId}`);
        const roomName = getRoom(documentId);
        const activeSockets = await io.in(roomName).fetchSockets();
        console.log(`[yjs-update] Active sockets in room "${roomName}":`, activeSockets.map(s => ({
          socketId: s.id,
          userId: s.data?.user?.id,
          name: s.data?.user?.name
        })));

        // Broadcast Yjs update to other collaborators in the room
        io.to(roomName).emit("yjs-update", {
          documentId,
          userId,
          update,
          clientId
        });
        console.log(`[yjs-update] Broadcasted to room "${roomName}" from socket: ${socket.id}`);
      } catch (error) {
        console.error("Error handling Yjs update:", error);
      }
    });

    // 4. Handle Offline Sync & Reconnect (Yjs sync-state-request)
    socket.on("sync-state-request", async ({ documentId, stateVector }) => {
      try {
        const role = socket.data.roles.get(String(documentId));
        if (!role) return; // User must have joined the document room

        // Fetch current document ydoc_state from DB
        const currentYdocState = await documentService.getYdocState(documentId, socket.data.user.id);

        let responseUpdate = null;
        if (currentYdocState) {
          if (stateVector) {
            // Yjs sync step 2: Encode the differences based on client's state vector
            const ydoc = new Y.Doc();
            Y.applyUpdate(ydoc, new Uint8Array(currentYdocState));
            responseUpdate = Y.encodeStateAsUpdate(ydoc, new Uint8Array(stateVector));
          } else {
            // If no state vector, send the entire state
            responseUpdate = new Uint8Array(currentYdocState);
          }
        }

        socket.emit("sync-state-response", {
          documentId,
          update: responseUpdate ? Array.from(responseUpdate) : null
        });
      } catch (error) {
        console.error("Error handling sync state request:", error);
      }
    });

    // 5. Handle collaborative awareness updates (Cursor, Selection)
    socket.on("awareness-update", ({ documentId, awareness }) => {
      // Basic security check: Make sure client is in the document room
      if (socket.rooms.has(getRoom(documentId))) {
        socket.to(getRoom(documentId)).emit("awareness-update", awareness);
      }
    });

    socket.on("cursor-update", ({ documentId, userId, cursor }) => {
      if (socket.rooms.has(getRoom(documentId))) {
        socket.to(getRoom(documentId)).emit("cursor-update", { userId, cursor });
      }
    });

    // 6. Handle manual or autosave notices
    socket.on("save-document", ({ documentId, version, savedAt }) => {
      if (socket.rooms.has(getRoom(documentId))) {
        io.to(getRoom(documentId)).emit("document-saved", {
          documentId,
          version,
          savedAt: savedAt || new Date().toISOString()
        });
      }
    });

    // 7. Client leaving room manually
    socket.on("leave-document", ({ documentId }) => {
      socket.leave(getRoom(documentId));
      socket.data.joinedDocuments.delete(String(documentId));
      socket.data.roles.delete(String(documentId));
      
      removeUser(documentId, socket.id);
      
      io.to(getRoom(documentId)).emit("user-list", {
        documentId,
        users: getUsers(documentId)
      });
    });

    // 8. Client disconnection
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
