import "dotenv/config";
import { connectDatabase } from "../src/config/db.js";
import { documentRepository } from "../src/modules/document/document.repository.js";

async function run() {
  await connectDatabase();
  console.log("Testing saveYjsUpdateAndMerge...");
  try {
    const res = await documentRepository.saveYjsUpdateAndMerge(3, 7, [1, 2, 3], "test_client");
    console.log("SUCCESS! Merged state length:", res.length);
  } catch (err) {
    console.error("FAILED WITH ERROR:", err);
  }
  process.exit(0);
}

run();
