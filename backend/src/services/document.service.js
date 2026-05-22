import {
  createDocument,
  createVersion,
  deleteDocumentById,
  findDocumentById,
  getRole,
  listDocumentsForUser,
  listVersions,
  updateDocumentSnapshot,
  findVersionById,
  restoreDocument
} from "../models/document.model.js";
import { httpError } from "../utils/http-error.js";

export async function assertCanRead(documentId, userId) {
  const role = await getRole(documentId, userId);
  if (!role) throw httpError(403, "You do not have access to this document");
  return role;
}

export async function assertCanEdit(documentId, userId) {
  const role = await assertCanRead(documentId, userId);
  if (!["owner", "editor"].includes(role)) {
    throw httpError(403, "Viewer cannot edit this document");
  }
  return role;
}

export async function getDocuments(userId) {
  return listDocumentsForUser(userId);
}

export async function addDocument(userId, title) {
  return createDocument({ title: title || "Tai lieu moi", ownerId: userId });
}

export async function getDocument(documentId, userId) {
  const role = await assertCanRead(documentId, userId);
  const doc = await findDocumentById(documentId);
  if (!doc) throw httpError(404, "Document not found");
  
  // Convert Buffer to base64 if ydoc_state exists in doc
  if (doc && doc.ydoc_state) {
    doc.ydocState = doc.ydoc_state.toString("base64");
  }
  
  return { ...doc, role };
}

export async function saveDocument(documentId, userId, payload) {
  await assertCanEdit(documentId, userId);
  await updateDocumentSnapshot(documentId, payload);
  await createVersion(documentId, userId);
  return getDocument(documentId, userId);
}

export async function removeDocument(documentId, userId) {
  const role = await assertCanRead(documentId, userId);
  if (role !== "owner") throw httpError(403, "Only owner can delete document");
  await deleteDocumentById(documentId);
}

export async function getDocumentVersions(documentId, userId) {
  await assertCanRead(documentId, userId);
  return listVersions(documentId);
}

export async function snapshotVersion(documentId, userId) {
  await assertCanEdit(documentId, userId);
  return createVersion(documentId, userId);
}

export async function getVersionDetail(documentId, versionId, userId) {
  await assertCanRead(documentId, userId);
  const version = await findVersionById(documentId, versionId);
  if (!version) throw httpError(404, "Version not found");
  return version;
}

export async function restoreVersion(documentId, versionId, userId) {
  await assertCanEdit(documentId, userId);
  const restoredDoc = await restoreDocument(documentId, versionId);
  if (!restoredDoc) throw httpError(404, "Version or Document not found");
  return restoredDoc;
}
