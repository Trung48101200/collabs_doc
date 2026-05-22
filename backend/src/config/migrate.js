import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("Starting database migration...");
  
  // 1. Connect to MySQL without specifying database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    const dbName = process.env.DB_NAME || "collab_docs";
    
    // 2. Create database if not exists
    console.log(`Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    
    // 3. Switch to database
    console.log(`Using database '${dbName}'...`);
    await connection.query(`USE ${dbName};`);

    // 4. Read migration SQL file
    const sqlPath = path.join(__dirname, "../../migrations/001_init.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Remove comments and split queries by ';'
    // Be careful with newlines and empty statements
    const queries = sqlContent
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "") // remove comments
      .split(";")
      .map((query) => query.trim())
      .filter((query) => query.length > 0 && !query.startsWith("USE ") && !query.startsWith("CREATE DATABASE "));

    console.log(`Executing ${queries.length} SQL queries from migration file...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        await connection.query(query);
      } catch (err) {
        console.error(`Error executing query #${i + 1}:`);
        console.error(query);
        throw err;
      }
    }

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigration };
