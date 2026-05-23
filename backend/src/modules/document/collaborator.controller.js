import { documentService } from "./document.service.js";

export async function getCollaboratorsAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    res.json(await documentService.listCollaborators(documentId, req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function inviteCollaboratorAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const result = await documentService.inviteCollaborator(documentId, req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function changeRoleAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const result = await documentService.changeCollaboratorRole(
      documentId,
      targetUserId,
      req.user.id,
      req.body.role
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteCollaboratorAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    await documentService.deleteCollaborator(documentId, targetUserId, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
