import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log("=== STARTING AUTOMATED DATABASE INITIALIZATION ===");

  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = Number(process.env.DB_PORT || 3306);
  const dbUser = process.env.DB_USER || "root";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "collab_docs";

  console.log(`Connecting to MySQL at ${dbHost}:${dbPort} as user '${dbUser}'...`);

  let connection;
  try {
    // Connect to MySQL server without specifying database name first
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true // Enable executing multi-line migrations
    });

    console.log("✓ Connected to MySQL server successfully.");

    // Create database if not exists
    console.log(`Creating database '${dbName}' if it does not exist...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✓ Database '${dbName}' verified/created.`);

    // Switch to database
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✓ Switched to database '${dbName}'.`);

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "../../migrations/001_init.sql");
    console.log(`Reading schema from ${migrationPath}...`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at path: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, "utf8");

    // Execute the SQL schema script
    console.log("Executing SQL migration script (creating tables and seeding data)...");
    await connection.query(sql);
    console.log("✓ Database tables created and seed data initialized successfully.");

    console.log("\n=== DATABASE INITIALIZATION COMPLETED SUCCESSFULY! ===");
  } catch (error) {
    console.error("\n❌ DATABASE INITIALIZATION FAILED:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
