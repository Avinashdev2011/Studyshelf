import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, "service-account.json"), "utf8"));

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://studyshelf-5f944-default-rtdb.firebaseio.com"
});

const db = getDatabase(app);

async function run() {
  const snapshot = await db.ref("/").once("value");
  const val = snapshot.val();
  if (!val) {
    console.log("Database root is empty or null.");
  } else {
    console.log("Root keys:", Object.keys(val));
    for (const key of Object.keys(val)) {
      if (typeof val[key] === 'object' && val[key] !== null) {
        console.log(`- ${key}: object with keys [${Object.keys(val[key]).slice(0, 5).join(', ')}]`);
      } else {
        console.log(`- ${key}: ${val[key]}`);
      }
    }
  }
  process.exit(0);
}

run().catch(console.error);
