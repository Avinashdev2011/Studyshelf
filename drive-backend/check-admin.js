import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

const auth = getAuth(app);
const db = getDatabase(app);

async function run() {
  console.log("Checking Firebase Auth users...");
  const listUsersResult = await auth.listUsers(100);
  console.log(`Found ${listUsersResult.users.length} Auth users:`);
  for (const user of listUsersResult.users) {
    console.log(`- UID: ${user.uid}, Email: ${user.email}, DisplayName: ${user.displayName}`);
  }

  console.log("\nChecking RTDB userData...");
  const snapshot = await db.ref("userData").once("value");
  const userData = snapshot.val();
  if (!userData) {
    console.log("No userData found in RTDB.");
  } else {
    console.log(`Found ${Object.keys(userData).length} users in RTDB:`);
    for (const [uid, data] of Object.entries(userData)) {
      console.log(`- UID: ${uid}, Email: ${data?.email}, Role: ${data?.role}, Name: ${data?.firstName} ${data?.lastName}`);
    }
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
