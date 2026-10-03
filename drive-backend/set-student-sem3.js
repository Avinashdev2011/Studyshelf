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

async function main() {
  const uid = "1SAxE8u2BFWGWUpWalChZgyJzNH3";
  await db.ref(`userData/${uid}`).update({ class: "3E" });
  await db.ref(`semesterList/3/divisionList/E/studentList/${uid}`).set({
    email: "test.student@studyshelf.com",
    firstName: "Test",
    lastName: "Student",
    rollNumber: 999,
    userId: uid,
    id: uid,
    class: "3E",
    pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common1.png?updatedAt=1750989714229"
  });
  console.log("Updated test.student@studyshelf.com to class 3E!");
  process.exit(0);
}
main();
