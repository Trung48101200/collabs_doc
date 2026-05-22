import {
  addDocument,
  getDocument,
  getDocuments,
  getDocumentVersions,
  removeDocument,
  saveDocument,
  snapshotVersion
} from "../services/document.service.js";

export async function listDocuments(req, res, next) {
  try {
    res.json(await getDocuments(req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function createDocumentAction(req, res, next) {
  try {
    const doc = await addDocument(req.user.id, req.body.title);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function getDocumentAction(req, res, next) {
  try {
    res.json(await getDocument(Number(req.params.id), req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function updateDocumentAction(req, res, next) {
  try {
    res.json(await saveDocument(Number(req.params.id), req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function deleteDocumentAction(req, res, next) {
  try {
    await removeDocument(Number(req.params.id), req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listVersionsAction(req, res, next) {
  try {
    res.json(await getDocumentVersions(Number(req.params.id), req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function createVersionAction(req, res, next) {
  try {
    res.status(201).json(await snapshotVersion(Number(req.params.id), req.user.id));
  } catch (error) {
    next(error);
  }
}
