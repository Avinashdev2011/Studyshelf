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

const completeDivisionE = {
  divisionGlobalData: { name: "E" },
  batchList: {
    "1": "1",
    "2": "2",
    "3": "3"
  },
  subjectList: {},
  subjectMetaDataList: {},
  noticeData: { divisionNoticeList: {} },
  timetableDayList: {
    Monday: { slotList: {} },
    Tuesday: { slotList: {} },
    Wednesday: { slotList: {} },
    Thursday: { slotList: {} },
    Friday: { slotList: {} },
    Saturday: { slotList: {} }
  },
  upcomingSubmissionData: {}
};

async function updateDivisions() {
  console.log("Updating RTDB semesterList: configuring complete Div E structure...");
  const semSnapshot = await db.ref("semesterList").once("value");
  const semesterData = semSnapshot.val();

  if (Array.isArray(semesterData)) {
    for (let sem = 1; sem < semesterData.length; sem++) {
      if (semesterData[sem]) {
        await db.ref(`semesterList/${sem}/divisionList/A`).remove();
        await db.ref(`semesterList/${sem}/divisionList/B`).remove();
        await db.ref(`semesterList/${sem}/divisionList/4`).remove();
        await db.ref(`semesterList/${sem}/divisionList/E`).set(completeDivisionE);
      }
    }
  } else if (typeof semesterData === "object" && semesterData !== null) {
    for (const sem of Object.keys(semesterData)) {
      await db.ref(`semesterList/${sem}/divisionList/A`).remove();
      await db.ref(`semesterList/${sem}/divisionList/B`).remove();
      await db.ref(`semesterList/${sem}/divisionList/4`).remove();
      await db.ref(`semesterList/${sem}/divisionList/E`).set(completeDivisionE);
    }
  }

  // Ensure admin user has class 1E
  const usersSnapshot = await db.ref("userData").once("value");
  const users = usersSnapshot.val();
  if (users) {
    for (const [uid, user] of Object.entries(users)) {
      if (user.role === "admin") {
        await db.ref(`userData/${uid}/class`).set("1E");
      }
    }
  }

  console.log("Div E updated with full structure including batchList.");
  process.exit(0);
}

updateDivisions().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
