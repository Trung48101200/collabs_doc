import { documentService } from "./document.service.js";

export async function listDocuments(req, res, next) {
  try {
    res.json(await documentService.listDocuments(req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function createDocumentAction(req, res, next) {
  try {
    const doc = await documentService.createDocument(req.user.id, req.body.title);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function copyDocumentAction(req, res, next) {
  try {
    const doc = await documentService.copyDocument(
      Number(req.params.id),
      req.user.id,
      req.body.title
    );
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function getDocumentAction(req, res, next) {
  try {
    res.json(await documentService.getDocument(Number(req.params.id), req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function updateDocumentAction(req, res, next) {
  try {
    res.json(await documentService.saveDocument(Number(req.params.id), req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function deleteDocumentAction(req, res, next) {
  try {
    await documentService.deleteDocument(Number(req.params.id), req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listVersionsAction(req, res, next) {
  try {
    res.json(await documentService.listVersions(Number(req.params.id), req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function createVersionAction(req, res, next) {
  try {
    res.status(201).json(await documentService.createVersion(Number(req.params.id), req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function getVersionDetailAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const versionId = Number(req.params.versionId);
    res.json(await documentService.getVersionDetail(documentId, versionId, req.user.id));
  } catch (error) {
    next(error);
  }
}

export async function restoreVersionAction(req, res, next) {
  try {
    const documentId = Number(req.params.id);
    const versionId = Number(req.params.versionId);
    const restoredDoc = await documentService.restoreVersion(documentId, versionId, req.user.id);

    const io = req.app.get("io");
    if (io) {
      io.to(`document:${documentId}`).emit("version-restored", {
        documentId,
        ydocState: restoredDoc.ydocState || null
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
