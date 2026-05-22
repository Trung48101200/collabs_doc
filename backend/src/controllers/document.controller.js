import {
  addDocument,
  getDocument,
  getDocuments,
  getDocumentVersions,
  removeDocument,
  saveDocument,
  snapshotVersion,
  getVersionDetail,
  restoreVersion
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

export async function getVersionDetailAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const versionId = Number(req.params.versionId);
    const version = await getVersionDetail(documentId, versionId, req.user.id);
    res.json(version);
  } catch (error) {
    next(error);
  }
}

export async function restoreVersionAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const versionId = Number(req.params.versionId);
    const restoredDoc = await restoreVersion(documentId, versionId, req.user.id);
    
    // Broadcast websocket update that the document has been restored
    const io = req.app.get("io");
    if (io) {
      io.to(`document:${documentId}`).emit("version-restored", {
        documentId,
        ydocState: restoredDoc.ydocState || (restoredDoc.ydoc_state ? restoredDoc.ydoc_state.toString("base64") : null)
      });
    }

    res.json({
      message: "Document restored successfully",
      document: restoredDoc
    });
  } catch (error) {
    next(error);
  }
}
