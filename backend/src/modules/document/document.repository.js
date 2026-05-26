import * as Y from "yjs";
import { Op } from "sequelize";
import {
  Document,
  DocumentCollaborator,
  DocumentUpdate,
  DocumentVersion,
  User
} from "../../models/index.js";

function normalizeId(value) {
  return Number(value);
}

function serializeDocument(document, role) {
  if (!document) return null;
  const plain = document.get({ plain: true });
  const result = {
    id: normalizeId(plain.id),
    title: plain.title,
    contentText: plain.contentText || "",
    contentJson: plain.contentJson || { type: "doc", content: [] },
    contentHtml: plain.contentHtml || "",
    ownerId: normalizeId(plain.ownerId),
    currentVersion: plain.currentVersion,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    ...(role ? { role } : {})
  };

  if (plain.ydocState) {
    result.ydocState = Buffer.from(plain.ydocState).toString("base64");
  }

  return result;
}

function serializeVersion(version) {
  if (!version) return null;
  const plain = version.get({ plain: true });
  const result = {
    id: normalizeId(plain.id),
    documentId: normalizeId(plain.documentId),
    versionNumber: plain.versionNumber,
    contentText: plain.contentText || "",
    contentJson: plain.contentJson || { type: "doc", content: [] },
    contentHtml: plain.contentHtml || "",
    changeSetKey: plain.changeSetKey || null,
    fromUpdateId: plain.fromUpdateId ? normalizeId(plain.fromUpdateId) : null,
    toUpdateId: plain.toUpdateId ? normalizeId(plain.toUpdateId) : null,
    updateCount: plain.updateCount || 0,
    createdBy: plain.createdBy ? normalizeId(plain.createdBy) : null,
    createdAt: plain.createdAt
  };

  if (plain.ydocSnapshot) {
    result.ydocState = Buffer.from(plain.ydocSnapshot).toString("base64");
  }

  return result;
}

function serializeCollaborator(row) {
  const plain = row.get({ plain: true });
  return {
    id: normalizeId(plain.id),
    userId: normalizeId(plain.userId),
    name: plain.user?.name,
    email: plain.user?.email,
    role: plain.role,
    createdAt: plain.createdAt
  };
}

export class DocumentRepository {
  async listDocumentsForUser(userId) {
    const [ownedDocuments, collaboratorRows] = await Promise.all([
      Document.findAll({ where: { ownerId: userId } }),
      DocumentCollaborator.findAll({
        where: { userId },
        include: [{ model: Document, as: "document" }]
      })
    ]);

    const documents = new Map();

    for (const document of ownedDocuments) {
      documents.set(String(document.id), serializeDocument(document, "owner"));
    }

    for (const row of collaboratorRows) {
      if (!row.document) continue;
      documents.set(String(row.document.id), serializeDocument(row.document, row.role));
    }

    return Array.from(documents.values()).sort((left, right) => {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }

  async createDocument({ title, ownerId }) {
    const document = await Document.create({
      title,
      contentText: "",
      contentJson: { type: "doc", content: [] },
      contentHtml: "",
      ownerId,
      currentVersion: 1
    });

    await DocumentCollaborator.create({
      documentId: document.id,
      userId: ownerId,
      role: "owner"
    });

    return this.findDocumentById(document.id);
  }

  async copyDocument({ sourceDocumentId, ownerId, title }) {
    const source = await Document.findByPk(sourceDocumentId);
    if (!source) return null;

    const document = await Document.create({
      title: title || `${source.title} (Copy)`,
      contentText: source.contentText || "",
      contentJson: source.contentJson || { type: "doc", content: [] },
      contentHtml: source.contentHtml || "",
      ydocState: source.ydocState || null,
      ownerId,
      currentVersion: 1
    });

    await DocumentCollaborator.create({
      documentId: document.id,
      userId: ownerId,
      role: "owner"
    });

    await DocumentVersion.create({
      documentId: document.id,
      versionNumber: 1,
      contentText: document.contentText,
      contentJson: document.contentJson,
      contentHtml: document.contentHtml,
      ydocSnapshot: document.ydocState,
      changeSetKey: `doc:${document.id}:updates:0-0:v1`,
      fromUpdateId: null,
      toUpdateId: null,
      updateCount: 0,
      createdBy: ownerId
    });

    return this.findDocumentById(document.id);
  }

  async findDocumentById(id) {
    const document = await Document.findByPk(id);
    return serializeDocument(document);
  }

  async updateDocumentSnapshot(id, payload) {
    const { title, contentText, contentJson, contentHtml, ydocState } = payload;
    const update = {
      contentText: contentText || "",
      contentJson: contentJson || { type: "doc", content: [] },
      contentHtml: contentHtml || "",
      ydocState: ydocState ? Buffer.from(ydocState, "base64") : null
    };

    if (title) update.title = title;

    await Document.update(update, { where: { id } });
    return this.findDocumentById(id);
  }

  async deleteDocumentById(id) {
    await Document.destroy({ where: { id } });
  }

  async getRole(documentId, userId) {
    const document = await Document.findByPk(documentId, {
      attributes: ["ownerId"]
    });
    
    if (document && Number(document.ownerId) === Number(userId)) {
      return "owner";
    }

    const collaborator = await DocumentCollaborator.findOne({
      where: { documentId, userId }
    });

    if (collaborator) return collaborator.role;
    return null;
  }

  async listVersions(documentId) {
    const versions = await DocumentVersion.findAll({
      where: { documentId },
      order: [["versionNumber", "DESC"]]
    });

    return versions.map(serializeVersion);
  }

  async createVersion(documentId, userId) {
    const document = await Document.findByPk(documentId);
    if (!document) return null;

    const latestVersion = await DocumentVersion.findOne({
      where: { documentId },
      order: [["versionNumber", "DESC"]]
    });
    const versionNumber = Number(latestVersion?.versionNumber || 0) + 1;
    const previousToUpdateId = Number(latestVersion?.toUpdateId || 0);
    const updates = await DocumentUpdate.findAll({
      where: {
        documentId,
        id: { [Op.gt]: previousToUpdateId }
      },
      attributes: ["id"],
      order: [["id", "ASC"]]
    });
    const fromUpdateId = updates.length ? Number(updates[0].id) : null;
    const toUpdateId = updates.length ? Number(updates[updates.length - 1].id) : previousToUpdateId || null;
    const updateCount = updates.length;
    const changeSetKey = `doc:${documentId}:updates:${fromUpdateId || previousToUpdateId || 0}-${toUpdateId || previousToUpdateId || 0}:v${versionNumber}`;

    const version = await DocumentVersion.create({
      documentId,
      versionNumber,
      contentText: document.contentText,
      contentJson: document.contentJson,
      contentHtml: document.contentHtml,
      ydocSnapshot: document.ydocState,
      changeSetKey,
      fromUpdateId,
      toUpdateId,
      updateCount,
      createdBy: userId
    });

    await document.update({ currentVersion: versionNumber });

    return serializeVersion(version);
  }

  async findVersionById(documentId, versionId) {
    const version = await DocumentVersion.findOne({
      where: { documentId, id: versionId }
    });
    return serializeVersion(version);
  }

  async restoreDocument(documentId, versionId) {
    const version = await DocumentVersion.findOne({
      where: { documentId, id: versionId }
    });
    if (!version) return null;

    await Document.update(
      {
        contentText: version.contentText || "",
        contentJson: version.contentJson || { type: "doc", content: [] },
        contentHtml: version.contentHtml || "",
        ydocState: version.ydocSnapshot,
        currentVersion: version.versionNumber
      },
      { where: { id: documentId } }
    );

    return this.findDocumentById(documentId);
  }

  async saveYjsUpdateAndMerge(documentId, userId, updateData, clientId) {
    const updateBuffer = Buffer.from(updateData);

    await DocumentUpdate.create({
      documentId,
      userId,
      updateData: updateBuffer,
      clientId: clientId || null
    });

    const document = await Document.findByPk(documentId, {
      attributes: ["id", "ydocState"]
    });

    const ydoc = new Y.Doc();
    if (document?.ydocState) {
      try {
        Y.applyUpdate(ydoc, new Uint8Array(document.ydocState));
      } catch (err) {
        console.warn(`[Yjs Merge Warning] Failed to apply old ydocState for document ${documentId}:`, err.message);
      }
    }

    try {
      Y.applyUpdate(ydoc, new Uint8Array(updateBuffer));
    } catch (err) {
      console.error(`[Yjs Merge Error] Failed to apply new update for document ${documentId}:`, err.message);
    }
    const mergedState = Y.encodeStateAsUpdate(ydoc);

    await Document.update(
      { ydocState: Buffer.from(mergedState) },
      { where: { id: documentId } }
    );

    return mergedState;
  }

  async getYdocState(documentId) {
    const document = await Document.findByPk(documentId, {
      attributes: ["ydocState"]
    });
    return document?.ydocState || null;
  }

  async listCollaborators(documentId) {
    const rows = await DocumentCollaborator.findAll({
      where: { documentId },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }]
    });
    return rows.map(serializeCollaborator);
  }

  async addCollaborator(documentId, userId, role) {
    await DocumentCollaborator.upsert({ documentId, userId, role });
    return { documentId, userId, role };
  }

  async updateCollaboratorRole(documentId, userId, role) {
    await DocumentCollaborator.update(
      { role },
      { where: { documentId, userId } }
    );
    return { documentId, userId, role };
  }

  async removeCollaborator(documentId, userId) {
    await DocumentCollaborator.destroy({ where: { documentId, userId } });
  }
}

export const documentRepository = new DocumentRepository();
