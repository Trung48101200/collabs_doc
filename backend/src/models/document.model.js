import { db } from "../config/db.js";
import * as Y from "yjs";

export async function listDocumentsForUser(userId) {
  const [rows] = await db.execute(
    `SELECT d.id, d.title, d.content_text AS contentText, d.owner_id AS ownerId,
            d.current_version AS currentVersion, d.updated_at AS updatedAt,
            COALESCE(dc.role, IF(d.owner_id = ?, 'owner', NULL)) AS role
       FROM documents d
       LEFT JOIN document_collaborators dc
         ON dc.document_id = d.id AND dc.user_id = ?
      WHERE d.owner_id = ? OR dc.user_id = ?
      ORDER BY d.updated_at DESC`,
    [userId, userId, userId, userId]
  );
  return rows;
}

export async function createDocument({ title, ownerId }) {
  const [result] = await db.execute(
    `INSERT INTO documents (title, content_text, content_json, content_html, owner_id)
     VALUES (?, '', JSON_OBJECT('type', 'doc', 'content', JSON_ARRAY()), '', ?)`,
    [title, ownerId]
  );

  await db.execute(
    `INSERT INTO document_collaborators (document_id, user_id, role)
     VALUES (?, ?, 'owner')`,
    [result.insertId, ownerId]
  );

  return findDocumentById(result.insertId);
}

export async function findDocumentById(id) {
  const [rows] = await db.execute(
    `SELECT id, title, content_text AS contentText, content_json AS contentJson,
            content_html AS contentHtml, owner_id AS ownerId,
            current_version AS currentVersion, created_at AS createdAt,
            updated_at AS updatedAt
       FROM documents
      WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function updateDocumentSnapshot(id, payload) {
  const { title, contentText, contentJson, contentHtml, ydocState } = payload;
  await db.execute(
    `UPDATE documents
        SET title = COALESCE(?, title),
            content_text = ?,
            content_json = CAST(? AS JSON),
            content_html = ?,
            ydoc_state = ?,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [
      title || null,
      contentText || "",
      JSON.stringify(contentJson || { type: "doc", content: [] }),
      contentHtml || "",
      ydocState ? Buffer.from(ydocState, "base64") : null,
      id
    ]
  );
  return findDocumentById(id);
}

export async function deleteDocumentById(id) {
  await db.execute(`DELETE FROM documents WHERE id = ?`, [id]);
}

export async function getRole(documentId, userId) {
  const [rows] = await db.execute(
    `SELECT role FROM document_collaborators
      WHERE document_id = ? AND user_id = ?`,
    [documentId, userId]
  );
  return rows[0]?.role || null;
}

export async function listVersions(documentId) {
  const [rows] = await db.execute(
    `SELECT id, version_number AS versionNumber, content_text AS contentText,
            created_by AS createdBy, created_at AS createdAt
       FROM document_versions
      WHERE document_id = ?
      ORDER BY version_number DESC`,
    [documentId]
  );
  return rows;
}

export async function createVersion(documentId, userId) {
  const doc = await findDocumentById(documentId);
  const [latest] = await db.execute(
    `SELECT COALESCE(MAX(version_number), 0) + 1 AS nextVersion
       FROM document_versions
      WHERE document_id = ?`,
    [documentId]
  );
  const versionNumber = latest[0].nextVersion;

  await db.execute(
    `INSERT INTO document_versions
       (document_id, version_number, content_text, content_json, content_html, ydoc_snapshot, created_by)
     SELECT id, ?, content_text, content_json, content_html, ydoc_state, ?
       FROM documents
      WHERE id = ?`,
    [versionNumber, userId, documentId]
  );

  await db.execute(
    `UPDATE documents SET current_version = ? WHERE id = ?`,
    [versionNumber, documentId]
  );

  return { ...doc, versionNumber };
}

export async function findVersionById(documentId, versionId) {
  const [rows] = await db.execute(
    `SELECT id, document_id AS documentId, version_number AS versionNumber,
            content_text AS contentText, content_json AS contentJson,
            content_html AS contentHtml, ydoc_snapshot AS ydocSnapshot,
            created_by AS createdBy, created_at AS createdAt
       FROM document_versions
      WHERE document_id = ? AND id = ?`,
    [documentId, versionId]
  );
  if (rows[0] && rows[0].ydocSnapshot) {
    // Convert Buffer to base64 string for API response
    rows[0].ydocState = rows[0].ydocSnapshot.toString("base64");
  }
  return rows[0] || null;
}

export async function restoreDocument(documentId, versionId) {
  const version = await findVersionById(documentId, versionId);
  if (!version) return null;

  await db.execute(
    `UPDATE documents
        SET content_text = ?,
            content_json = ?,
            content_html = ?,
            ydoc_state = ?,
            current_version = ?
      WHERE id = ?`,
    [
      version.contentText || "",
      JSON.stringify(version.contentJson),
      version.contentHtml || "",
      version.ydocSnapshot,
      version.versionNumber,
      documentId
    ]
  );

  return findDocumentById(documentId);
}

export async function saveYjsUpdateAndMerge(documentId, userId, updateData, clientId) {
  const updateBuffer = Buffer.from(updateData);
  
  // 1. Save small update to document_updates table
  await db.execute(
    `INSERT INTO document_updates (document_id, user_id, update_data, client_id)
     VALUES (?, ?, ?, ?)`,
    [documentId, userId, updateBuffer, clientId || null]
  );

  // 2. Fetch current ydoc_state from documents
  const [rows] = await db.execute(
    `SELECT ydoc_state FROM documents WHERE id = ?`,
    [documentId]
  );
  
  const currentYdocState = rows[0]?.ydoc_state;

  // 3. Initialize Y.Doc and apply current state
  const ydoc = new Y.Doc();
  if (currentYdocState) {
    Y.applyUpdate(ydoc, new Uint8Array(currentYdocState));
  }

  // 4. Apply the new update
  Y.applyUpdate(ydoc, new Uint8Array(updateBuffer));

  // 5. Encode the new merged state as update
  const mergedState = Y.encodeStateAsUpdate(ydoc);

  // 6. Update the ydoc_state in documents table
  await db.execute(
    `UPDATE documents
        SET ydoc_state = ?
      WHERE id = ?`,
    [Buffer.from(mergedState), documentId]
  );

  return mergedState;
}
