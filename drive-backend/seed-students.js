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

const sampleStudents = [
  {
    firstName: "Aarav",
    lastName: "Sharma",
    rollNumber: "101",
    email: "aarav.sharma@studyshelf.com",
    password: "Student@123",
    pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png"
  },
  {
    firstName: "Priya",
    lastName: "Patel",
    rollNumber: "102",
    email: "priya.patel@studyshelf.com",
    password: "Student@123",
    pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/f1.png"
  }
];

async function seed() {
  for (const st of sampleStudents) {
    let uid;
    try {
      const existing = await auth.getUserByEmail(st.email);
      uid = existing.uid;
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        const created = await auth.createUser({
          email: st.email,
          password: st.password,
          displayName: `${st.firstName} ${st.lastName}`,
          emailVerified: true
        });
        uid = created.uid;
      } else {
        throw e;
      }
    }

    const userData = {
      id: uid,
      userId: uid,
      firstName: st.firstName,
      lastName: st.lastName,
      rollNumber: st.rollNumber,
      email: st.email,
      role: "student",
      class: "1E",
      theme: "default",
      pfpLink: st.pfpLink,
      medalList: { gold: 0, silver: 0, bronze: 0 }
    };

    await db.ref(`userData/${uid}`).set(userData);
    console.log(`Seeded student ${st.firstName} ${st.lastName} (UID: ${uid}, Class: 1E)`);
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
