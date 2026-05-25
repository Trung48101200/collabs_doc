import "dotenv/config";
import { connectDatabase } from "../src/config/db.js";
import { DocumentUpdate } from "../src/models/index.js";

async function check() {
  await connectDatabase();
  const updates = await DocumentUpdate.findAll({
    limit: 10,
    order: [["id", "DESC"]]
  });
  console.log("LAST 10 UPDATES:", JSON.stringify(updates, null, 2));
  process.exit(0);
}

check().catch(console.error);
