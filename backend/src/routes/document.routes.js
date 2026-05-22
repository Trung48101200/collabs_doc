import { Router } from "express";
import { mockAuth } from "../middlewares/auth.middleware.js";
import {
  createDocumentAction,
  createVersionAction,
  deleteDocumentAction,
  getDocumentAction,
  listDocuments,
  listVersionsAction,
  updateDocumentAction
} from "../controllers/document.controller.js";

export const documentRoutes = Router();

documentRoutes.use(mockAuth);

documentRoutes.get("/", listDocuments);
documentRoutes.post("/", createDocumentAction);
documentRoutes.get("/:id", getDocumentAction);
documentRoutes.put("/:id", updateDocumentAction);
documentRoutes.delete("/:id", deleteDocumentAction);
documentRoutes.get("/:id/versions", listVersionsAction);
documentRoutes.post("/:id/versions", createVersionAction);
