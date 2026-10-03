import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, "service-account.json"), "utf8"));

const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://studyshelf-5f944-default-rtdb.firebaseio.com"
}) : getApps()[0];

const db = getDatabase(app);

async function clean() {
  await db.ref('semesterList/1/divisionList/E/subjectMetaDataList/"').remove();
  await db.ref('semesterList/1/divisionList/E/subjectList/"').remove();
  const snap = await db.ref("semesterList/1/divisionList/E/subjectMetaDataList").once("value");
  console.log("Cleaned Div E Subjects:", JSON.stringify(snap.val(), null, 2));
  process.exit(0);
}
clean();
