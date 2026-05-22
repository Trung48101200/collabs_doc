import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

export async function createUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
    [name, email, passwordHash]
  );
  
  return {
    id: result.insertId,
    name,
    email,
  };
}

export async function findUserByEmail(email) {
  const [rows] = await db.execute(
    `SELECT id, name, email, password_hash AS passwordHash FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await db.execute(
    `SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}
