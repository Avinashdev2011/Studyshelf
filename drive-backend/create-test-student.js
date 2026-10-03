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

const STUDENT_EMAIL = "test.student@studyshelf.com";
const STUDENT_PASSWORD = "Student@Test123";

async function main() {
  console.log(`Creating test student: ${STUDENT_EMAIL}...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(STUDENT_EMAIL);
    console.log(`Found existing user with UID: ${userRecord.uid}. Resetting password...`);
    userRecord = await auth.updateUser(userRecord.uid, {
      password: STUDENT_PASSWORD,
      displayName: "Test Student",
      emailVerified: true,
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.log("User not found. Creating new Firebase Auth user...");
      userRecord = await auth.createUser({
        email: STUDENT_EMAIL,
        password: STUDENT_PASSWORD,
        displayName: "Test Student",
        emailVerified: true,
      });
      console.log(`Created user with UID: ${userRecord.uid}`);
    } else {
      throw error;
    }
  }

  const uid = userRecord.uid;

  const studentData = {
    id: uid,
    userId: uid,
    email: STUDENT_EMAIL,
    firstName: "Test",
    lastName: "Student",
    role: "student",
    class: "1E",    // Semester 1, Division E
    rollNumber: 999,
    theme: "default",
    pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common1.png?updatedAt=1750989714229",
    medalList: { gold: 0, silver: 0, bronze: 0 },
  };

  await db.ref(`userData/${uid}`).set(studentData);
  console.log("Student profile saved to RTDB at userData/" + uid);

  // Add to semesterList/1/divisionList/E/studentList
  await db.ref(`semesterList/1/divisionList/E/studentList/${uid}`).set({
    id: uid,
    userId: uid,
    email: STUDENT_EMAIL,
    firstName: "Test",
    lastName: "Student",
    rollNumber: 999,
    pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common1.png?updatedAt=1750989714229",
  });
  console.log("Student added to semesterList/1/divisionList/E/studentList");

  console.log("\n=========================================");
  console.log("SUCCESS! Test student credentials:");
  console.log(`Email:    ${STUDENT_EMAIL}`);
  console.log(`Password: ${STUDENT_PASSWORD}`);
  console.log(`Class:    1E  (Sem 1, Div E)`);
  console.log(`Roll No:  999`);
  console.log(`UID:      ${uid}`);
  console.log("=========================================");

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create student:", err);
  process.exit(1);
});
