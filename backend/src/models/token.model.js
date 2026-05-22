import { db } from "../config/db.js";

export async function saveRefreshToken(userId, token, expiresAt) {
  // Format Date object to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
  const formattedExpiresAt = expiresAt instanceof Date 
    ? expiresAt.toISOString().slice(0, 19).replace('T', ' ')
    : expiresAt;

  await db.execute(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, formattedExpiresAt]
  );
}

export async function findRefreshToken(token) {
  const [rows] = await db.execute(
    `SELECT id, user_id AS userId, token, expires_at AS expiresAt, created_at AS createdAt
       FROM refresh_tokens
      WHERE token = ?`,
    [token]
  );
  return rows[0] || null;
}

export async function deleteRefreshToken(token) {
  await db.execute(
    `DELETE FROM refresh_tokens WHERE token = ?`,
    [token]
  );
}

export async function deleteUserRefreshTokens(userId) {
  await db.execute(
    `DELETE FROM refresh_tokens WHERE user_id = ?`,
    [userId]
  );
}

export async function blacklistToken(token, expiresAt) {
  // Format Date object to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
  const formattedExpiresAt = expiresAt instanceof Date 
    ? expiresAt.toISOString().slice(0, 19).replace('T', ' ')
    : expiresAt;

  await db.execute(
    `INSERT INTO blacklisted_tokens (token, expires_at)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)`,
    [token, formattedExpiresAt]
  );
}

export async function isTokenBlacklisted(token) {
  const [rows] = await db.execute(
    `SELECT id FROM blacklisted_tokens WHERE token = ?`,
    [token]
  );
  return rows.length > 0;
}

