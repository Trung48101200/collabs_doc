import { documentRepository } from "./document.repository.js";
import { userRepository } from "../user/user.repository.js";
import { httpError } from "../../utils/http-error.js";

export class DocumentService {
  constructor(repository) {
    this.repository = repository;
  }

  async assertCanRead(documentId, userId) {
    const role = await this.repository.getRole(documentId, userId);
    if (!role) throw httpError(403, "You do not have access to this document");
    return role;
  }

  async assertCanEdit(documentId, userId) {
    const role = await this.assertCanRead(documentId, userId);
    if (!["owner", "editor"].includes(role)) {
      throw httpError(403, "Viewer cannot edit this document");
    }
    return role;
  }

  async assertOwner(documentId, userId) {
    const role = await this.assertCanRead(documentId, userId);
    if (role !== "owner") throw httpError(403, "Only the document owner can perform this action");
    return role;
  }

  async listDocuments(userId) {
    return this.repository.listDocumentsForUser(userId);
  }

  async createDocument(userId, title) {
    return this.repository.createDocument({
      title: title || "Tai lieu moi",
      ownerId: userId
    });
  }

  async copyDocument(documentId, userId, title) {
    await this.assertCanRead(documentId, userId);
    const copiedDocument = await this.repository.copyDocument({
      sourceDocumentId: documentId,
      ownerId: userId,
      title
    });

    if (!copiedDocument) throw httpError(404, "Document not found");
    return { ...copiedDocument, role: "owner" };
  }

  async getDocument(documentId, userId) {
    const role = await this.assertCanRead(documentId, userId);
    const document = await this.repository.findDocumentById(documentId);
    if (!document) throw httpError(404, "Document not found");
    return { ...document, role };
  }

  async saveDocument(documentId, userId, payload) {
    await this.assertCanEdit(documentId, userId);
    await this.repository.updateDocumentSnapshot(documentId, payload);
    await this.repository.createVersion(documentId, userId);
    return this.getDocument(documentId, userId);
  }

  async deleteDocument(documentId, userId) {
    const role = await this.assertCanRead(documentId, userId);
    if (role !== "owner") throw httpError(403, "Only owner can delete document");
    await this.repository.deleteDocumentById(documentId);
  }

  async listVersions(documentId, userId) {
    await this.assertCanRead(documentId, userId);
    return this.repository.listVersions(documentId);
  }

  async createVersion(documentId, userId) {
    await this.assertCanEdit(documentId, userId);
    const version = await this.repository.createVersion(documentId, userId);
    if (!version) throw httpError(404, "Document not found");
    return version;
  }

  async getVersionDetail(documentId, versionId, userId) {
    await this.assertCanRead(documentId, userId);
    const version = await this.repository.findVersionById(documentId, versionId);
    if (!version) throw httpError(404, "Version not found");
    return version;
  }

  async restoreVersion(documentId, versionId, userId) {
    await this.assertCanEdit(documentId, userId);
    const restoredDoc = await this.repository.restoreDocument(documentId, versionId);
    if (!restoredDoc) throw httpError(404, "Version or Document not found");
    return restoredDoc;
  }

  async acceptRealtimeUpdate({ documentId, userId, update, clientId }) {
    await this.assertCanEdit(documentId, userId);
    if (!Array.isArray(update)) throw httpError(400, "Invalid Yjs update payload");
    await this.repository.saveYjsUpdateAndMerge(documentId, userId, update, clientId);
    return { documentId, userId, update, clientId };
  }

  async getYdocState(documentId, userId) {
    await this.assertCanRead(documentId, userId);
    return this.repository.getYdocState(documentId);
  }

  async listCollaborators(documentId, userId) {
    await this.assertCanRead(documentId, userId);
    return this.repository.listCollaborators(documentId);
  }

  async inviteCollaborator(documentId, currentUserId, { email, role }) {
    if (!email || !role) throw httpError(400, "Email and role are required");
    if (!["editor", "viewer"].includes(role)) {
      throw httpError(400, "Invalid role. Role must be 'editor' or 'viewer'");
    }

    await this.assertOwner(documentId, currentUserId);

    const invitee = await userRepository.findUserByEmail(email);
    if (!invitee) throw httpError(404, `User with email '${email}' not found`);
    if (invitee.id === currentUserId) throw httpError(400, "You cannot invite yourself");

    const result = await this.repository.addCollaborator(documentId, invitee.id, role);
    return {
      message: "Collaborator added successfully",
      collaborator: {
        userId: invitee.id,
        name: invitee.name,
        email: invitee.email,
        role: result.role
      }
    };
  }

  async changeCollaboratorRole(documentId, targetUserId, currentUserId, role) {
    if (!role || !["editor", "viewer"].includes(role)) {
      throw httpError(400, "Valid role is required ('editor', 'viewer')");
    }

    await this.assertOwner(documentId, currentUserId);

    if (targetUserId === currentUserId) {
      throw httpError(400, "You cannot modify your own role");
    }

    const targetRole = await this.repository.getRole(documentId, targetUserId);
    if (!targetRole) throw httpError(404, "Collaborator not found for this document");

    const result = await this.repository.updateCollaboratorRole(documentId, targetUserId, role);
    return {
      message: "Collaborator role updated successfully",
      collaborator: result
    };
  }

  async deleteCollaborator(documentId, targetUserId, currentUserId) {
    const currentRole = await this.assertCanRead(documentId, currentUserId);

    if (currentUserId !== targetUserId && currentRole !== "owner") {
      throw httpError(403, "Only the owner can remove other collaborators");
    }

    const targetRole = await this.repository.getRole(documentId, targetUserId);
    if (!targetRole) throw httpError(404, "Collaborator not found");
    if (targetRole === "owner") {
      throw httpError(400, "Cannot remove the owner.");
    }

    await this.repository.removeCollaborator(documentId, targetUserId);
  }
}

export const documentService = new DocumentService(documentRepository);
