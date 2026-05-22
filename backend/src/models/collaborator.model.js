import { db } from "../config/db.js";

export async function listCollaborators(documentId) {
  const [rows] = await db.execute(
    `SELECT dc.id, dc.user_id AS userId, u.name, u.email, dc.role, dc.created_at AS createdAt
       FROM document_collaborators dc
       JOIN users u ON dc.user_id = u.id
      WHERE dc.document_id = ?`,
    [documentId]
  );
  return rows;
}

export async function addCollaborator(documentId, userId, role) {
  await db.execute(
    `INSERT INTO document_collaborators (document_id, user_id, role)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE role = VALUES(role)`,
    [documentId, userId, role]
  );
  
  return { documentId, userId, role };
}

export async function updateCollaboratorRole(documentId, userId, role) {
  await db.execute(
    `UPDATE document_collaborators
        SET role = ?
      WHERE document_id = ? AND user_id = ?`,
    [role, documentId, userId]
  );
  return { documentId, userId, role };
}

export async function removeCollaborator(documentId, userId) {
  await db.execute(
    `DELETE FROM document_collaborators
      WHERE document_id = ? AND user_id = ?`,
    [documentId, userId]
  );
}
