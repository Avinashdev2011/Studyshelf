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

const subjects = [
  "Maths",
  "DSMP",
  "DS",
  "SE",
  "DMS",
  "MDM",
  "OP",
  "FP"
];

const DEFAULT_ICON = "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";

async function main() {
  console.log("Adding subjects to Semester 3, Division E...");

  // 1. Ensure Semester 3 Division E structure exists
  const divRef = db.ref("semesterList/3/divisionList/E");
  const divSnap = await divRef.once("value");
  
  if (!divSnap.exists()) {
    console.log("Creating Semester 3 Div E initial structure...");
    await divRef.set({
      divisionGlobalData: { name: "E" },
      batchList: { "1": "1", "2": "2", "3": "3" },
      noticeData: { divisionNoticeList: {} },
      timetableDayList: {
        Monday: { slotList: {} },
        Tuesday: { slotList: {} },
        Wednesday: { slotList: {} },
        Thursday: { slotList: {} },
        Friday: { slotList: {} },
        Saturday: { slotList: {} }
      }
    });
  }

  // 2. Add each subject
  const metaUpdates = {};
  for (const subj of subjects) {
    metaUpdates[subj] = {
      name: subj,
      iconLink: DEFAULT_ICON
    };
  }

  await db.ref("semesterList/3/divisionList/E/subjectMetaDataList").update(metaUpdates);
  console.log("Updated subjectMetaDataList successfully!");

  // Verify
  const verifySnap = await db.ref("semesterList/3/divisionList/E/subjectMetaDataList").once("value");
  console.log("\nCurrent subjects in Sem 3, Div E:");
  console.log(JSON.stringify(verifySnap.val(), null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error("Error adding subjects:", err);
  process.exit(1);
});
