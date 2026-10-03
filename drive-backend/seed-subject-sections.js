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

async function seed() {
  console.log("Seeding sample sections and files (PDF, PPT, DOC) for Maths in Sem 3, Div E...");

  const mathsContainers = {
    "cat_unit1": {
      metaData: {
        name: "Unit 1: Differential Calculus",
        isVisible: true
      },
      itemList: {
        "item_pdf1": {
          name: "Calculus Formula Sheet.pdf",
          link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          attachmentId: "custom-link",
          createdAt: Date.now() - 3600000,
          isVisible: true
        },
        "item_doc1": {
          name: "Assignment 1 Questions.docx",
          link: "https://docs.google.com/document",
          attachmentId: "custom-link",
          createdAt: Date.now() - 7200000,
          isVisible: true
        }
      }
    },
    "cat_presentations": {
      metaData: {
        name: "Lecture Presentations (PPT)",
        isVisible: true
      },
      itemList: {
        "item_ppt1": {
          name: "Week 1 Lecture Slides.pptx",
          link: "https://docs.google.com/presentation",
          attachmentId: "custom-link",
          createdAt: Date.now() - 10800000,
          isVisible: true
        },
        "item_ppt2": {
          name: "Matrix Operations Review.ppt",
          link: "https://docs.google.com/presentation",
          attachmentId: "custom-link",
          createdAt: Date.now() - 14400000,
          isVisible: true
        }
      }
    },
    "cat_pyq": {
      metaData: {
        name: "Previous Year Question Papers",
        isVisible: true
      },
      itemList: {
        "item_pdf2": {
          name: "Winter 2025 Model Question Paper.pdf",
          link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          attachmentId: "custom-link",
          createdAt: Date.now() - 18000000,
          isVisible: true
        }
      }
    }
  };

  await db.ref("semesterList/3/divisionList/E/subjectList/Maths/containerList").set(mathsContainers);
  console.log("✓ Successfully seeded sample sections and files for Maths!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
