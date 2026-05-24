import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  copyDocumentAction,
  createDocumentAction,
  createVersionAction,
  deleteDocumentAction,
  getDocumentAction,
  getVersionDetailAction,
  listDocuments,
  listVersionsAction,
  restoreVersionAction,
  updateDocumentAction
} from "./document.controller.js";
import {
  changeRoleAction,
  deleteCollaboratorAction,
  getCollaboratorsAction,
  inviteCollaboratorAction
} from "./collaborator.controller.js";

export const documentRoutes = Router();

documentRoutes.use(authMiddleware);

documentRoutes.get("/", listDocuments);
documentRoutes.post("/", createDocumentAction);
documentRoutes.get("/:id", getDocumentAction);
documentRoutes.put("/:id", updateDocumentAction);
documentRoutes.delete("/:id", deleteDocumentAction);
documentRoutes.post("/:id/copy", copyDocumentAction);

documentRoutes.get("/:id/collaborators", getCollaboratorsAction);
documentRoutes.post("/:id/collaborators", inviteCollaboratorAction);
documentRoutes.put("/:id/collaborators/:userId", changeRoleAction);
documentRoutes.delete("/:id/collaborators/:userId", deleteCollaboratorAction);

documentRoutes.get("/:id/versions", listVersionsAction);
documentRoutes.post("/:id/versions", createVersionAction);
documentRoutes.get("/:id/versions/:versionId", getVersionDetailAction);
documentRoutes.post("/:id/versions/:versionId/restore", restoreVersionAction);
