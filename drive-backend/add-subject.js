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

/**
 * Add a new subject to a specific semester and division, or to all divisions in a semester.
 * 
 * @param {string|number} semester - e.g. 1
 * @param {string} division - e.g. "E" or "all"
 * @param {string} subjectKey - e.g. "Mathematics" or "Python"
 * @param {string} subjectName - e.g. "Mathematics" or "Python Programming"
 * @param {string} iconLink - URL to subject icon image
 */
export async function addSubject({ semester, division = "all", subjectKey, subjectName, iconLink }) {
  const semStr = String(semester);
  const key = subjectKey || subjectName;
  const name = subjectName || subjectKey;
  const icon = iconLink || "https://ik.imagekit.io/yn9gz2n2g/others/maths.png";

  const semRef = db.ref(`semesterList/${semStr}/divisionList`);
  const snapshot = await semRef.once("value");

  if (!snapshot.exists()) {
    console.error(`Semester ${semStr} divisionList not found!`);
    return;
  }

  const divisions = snapshot.val();
  const targetDivisions = division === "all" ? Object.keys(divisions) : [division];

  for (const div of targetDivisions) {
    console.log(`Adding subject "${name}" to Semester ${semStr}, Division ${div}...`);
    
    // 1. Add to subjectMetaDataList
    await db.ref(`semesterList/${semStr}/divisionList/${div}/subjectMetaDataList/${key}`).set({
      name: name,
      iconLink: icon
    });

    // 2. Initialize subjectList container if not exists
    const subjectListRef = db.ref(`semesterList/${semStr}/divisionList/${div}/subjectList/${key}`);
    const existing = await subjectListRef.once("value");
    if (!existing.exists()) {
      await subjectListRef.set({
        containerList: {}
      });
    }
    console.log(`✓ Subject "${name}" successfully added to Div ${div}!`);
  }
}

// CLI usage if run directly
const args = process.argv.slice(2);
if (args.length >= 2) {
  // Usage: node add-subject.js <semester> <division> <subjectName> [iconLink]
  const [semester, division, subjectName, iconLink] = args;
  addSubject({
    semester,
    division,
    subjectKey: subjectName,
    subjectName,
    iconLink
  }).then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
