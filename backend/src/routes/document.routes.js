import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createDocumentAction,
  createVersionAction,
  deleteDocumentAction,
  getDocumentAction,
  listDocuments,
  listVersionsAction,
  updateDocumentAction,
  getVersionDetailAction,
  restoreVersionAction
} from "../controllers/document.controller.js";
import {
  getCollaboratorsAction,
  inviteCollaboratorAction,
  changeRoleAction,
  deleteCollaboratorAction
} from "../controllers/collaborator.controller.js";

export const documentRoutes = Router();

// Secure all document routes with JWT authentication
documentRoutes.use(authMiddleware);

// Core document CRUD routes
documentRoutes.get("/", listDocuments);
documentRoutes.post("/", createDocumentAction);
documentRoutes.get("/:id", getDocumentAction);
documentRoutes.put("/:id", updateDocumentAction);
documentRoutes.delete("/:id", deleteDocumentAction);

// Document collaborators routes
documentRoutes.get("/:id/collaborators", getCollaboratorsAction);
documentRoutes.post("/:id/collaborators", inviteCollaboratorAction);
documentRoutes.put("/:id/collaborators/:userId", changeRoleAction);
documentRoutes.delete("/:id/collaborators/:userId", deleteCollaboratorAction);

// Version history routes
documentRoutes.get("/:id/versions", listVersionsAction);
documentRoutes.post("/:id/versions", createVersionAction);
documentRoutes.get("/:id/versions/:versionId", getVersionDetailAction);
documentRoutes.post("/:id/versions/:versionId/restore", restoreVersionAction);
