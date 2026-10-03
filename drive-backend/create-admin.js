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

const ADMIN_EMAIL = "admin@studyshelf.com";
const ADMIN_PASSWORD = "Admin@StudyShelf2026!";

async function main() {
  console.log(`Setting up admin user: ${ADMIN_EMAIL}...`);
  
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`Found existing user with UID: ${userRecord.uid}. Updating password...`);
    userRecord = await auth.updateUser(userRecord.uid, {
      password: ADMIN_PASSWORD,
      displayName: "Admin",
      emailVerified: true
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.log("User not found. Creating new Firebase Auth user...");
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: "Admin",
        emailVerified: true
      });
      console.log(`Created user with UID: ${userRecord.uid}`);
    } else {
      throw error;
    }
  }

  const uid = userRecord.uid;

  console.log(`Setting role: 'admin' and profile data in RTDB at userData/${uid}...`);
  const adminUserData = {
    id: uid,
    userId: uid,
    email: ADMIN_EMAIL,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    class: "1A",
    theme: "default",
    pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m7.png",
    medalList: {
      gold: 0,
      silver: 0,
      bronze: 0
    }
  };

  await db.ref(`userData/${uid}`).set(adminUserData);
  console.log("Admin profile successfully saved to RTDB.");

  // Check if semesterList exists in RTDB
  const semSnapshot = await db.ref("semesterList").once("value");
  if (!semSnapshot.exists() || !semSnapshot.val()) {
    console.log("Initializing semesterList (Semesters 1-6 with Div A and B)...");
    const defaultSemesters = {};
    for (let sem = 1; sem <= 6; sem++) {
      defaultSemesters[sem] = {
        semesterGlobalData: {
          semesterName: String(sem),
          noticeList: {}
        },
        divisionList: {
          A: {
            divisionGlobalData: { name: "A" },
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
            }
          },
          B: {
            divisionGlobalData: { name: "B" },
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
            }
          }
        }
      };
    }
    await db.ref("semesterList").set(defaultSemesters);
    console.log("Default semesterList initialized.");
  }

  // Check if globalData exists in RTDB
  const globalSnapshot = await db.ref("globalData").once("value");
  if (!globalSnapshot.exists() || !globalSnapshot.val()) {
    console.log("Initializing globalData...");
    await db.ref("globalData").set({
      appName: "StudyShelf"
    });
    console.log("globalData initialized.");
  }

  console.log("\n========================================");
  console.log("SUCCESS! Admin credentials created:");
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Role:     admin`);
  console.log(`UID:      ${uid}`);
  console.log("========================================");

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to setup admin:", err);
  process.exit(1);
});
