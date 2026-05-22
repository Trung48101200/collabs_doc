import { getRole } from "../models/document.model.js";
import { findUserByEmail } from "../models/user.model.js";
import {
  listCollaborators,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator
} from "../models/collaborator.model.js";
import { httpError } from "../utils/http-error.js";

export async function getCollaboratorsAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const userId = req.user.id;

    // Check if user has access to document
    const role = await getRole(documentId, userId);
    if (!role) {
      throw httpError(403, "You do not have access to this document");
    }

    const collaborators = await listCollaborators(documentId);
    res.json(collaborators);
  } catch (error) {
    next(error);
  }
}

export async function inviteCollaboratorAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const currentUserId = req.user.id;
    const { email, role } = req.body;

    if (!email || !role) {
      throw httpError(400, "Email and role are required");
    }

    if (!["editor", "viewer"].includes(role)) {
      throw httpError(400, "Invalid role. Role must be 'editor' or 'viewer'");
    }

    // Check if current user is the owner
    const currentRole = await getRole(documentId, currentUserId);
    if (currentRole !== "owner") {
      throw httpError(403, "Only the document owner can invite collaborators");
    }

    // Find the user to invite
    const invitee = await findUserByEmail(email);
    if (!invitee) {
      throw httpError(404, `User with email '${email}' not found`);
    }

    if (invitee.id === currentUserId) {
      throw httpError(400, "You cannot invite yourself");
    }

    const result = await addCollaborator(documentId, invitee.id, role);
    res.status(201).json({
      message: "Collaborator added successfully",
      collaborator: {
        userId: invitee.id,
        name: invitee.name,
        email: invitee.email,
        role: result.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function changeRoleAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const currentUserId = req.user.id;
    const { role } = req.body;

    if (!role || !["owner", "editor", "viewer"].includes(role)) {
      throw httpError(400, "Valid role is required ('owner', 'editor', 'viewer')");
    }

    // Check if current user is owner
    const currentRole = await getRole(documentId, currentUserId);
    if (currentRole !== "owner") {
      throw httpError(403, "Only the owner can modify collaborator roles");
    }

    if (targetUserId === currentUserId) {
      throw httpError(400, "You cannot modify your own role");
    }

    const targetRole = await getRole(documentId, targetUserId);
    if (!targetRole) {
      throw httpError(404, "Collaborator not found for this document");
    }

    // If changing to 'owner', we demote the current owner to 'editor' or just add a new owner
    // According to document_collaborators schema, we can have multiple or one. Let's just update the target user.
    // If setting a new owner, optionally demote current owner:
    if (role === "owner") {
      await updateCollaboratorRole(documentId, currentUserId, "editor");
      await updateCollaboratorRole(documentId, targetUserId, "owner");
      // Also need to update the owner_id in the documents table
      // Let's import or write directly to MySQL to maintain consistency
      const { db } = await import("../config/db.js");
      await db.execute(`UPDATE documents SET owner_id = ? WHERE id = ?`, [targetUserId, documentId]);
      
      return res.json({
        message: "Ownership transferred successfully. You are now an editor.",
        collaborator: { userId: targetUserId, role }
      });
    }

    const result = await updateCollaboratorRole(documentId, targetUserId, role);
    res.json({
      message: "Collaborator role updated successfully",
      collaborator: result
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCollaboratorAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const currentUserId = req.user.id;

    // A collaborator can remove themselves, or the owner can remove any collaborator
    const currentRole = await getRole(documentId, currentUserId);
    if (!currentRole) {
      throw httpError(403, "You do not have access to this document");
    }

    if (currentUserId !== targetUserId && currentRole !== "owner") {
      throw httpError(403, "Only the owner can remove other collaborators");
    }

    const targetRole = await getRole(documentId, targetUserId);
    if (!targetRole) {
      throw httpError(404, "Collaborator not found");
    }

    if (targetRole === "owner") {
      throw httpError(400, "Cannot remove the owner. Transfer ownership first.");
    }

    await removeCollaborator(documentId, targetUserId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
