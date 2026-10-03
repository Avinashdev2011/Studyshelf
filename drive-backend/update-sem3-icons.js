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

function makeSvgDataUri(bgColor1, bgColor2, svgPathContent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor1}"/>
        <stop offset="100%" stop-color="${bgColor2}"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#grad)"/>
    <g fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(14, 14)">
      ${svgPathContent}
    </g>
  </svg>`.replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. Maths - Sigma and Pi math symbols (Indigo gradient)
const mathsIcon = makeSvgDataUri(
  "#6366F1", "#4338CA",
  `<path d="M4 6h28l-16 12 16 12H4" stroke-width="3"/>
   <path d="M10 22h8" stroke-width="2.5"/>`
);

// 2. DSMP - Microprocessor / Chip (Amber/Orange gradient)
const dsmpIcon = makeSvgDataUri(
  "#F59E0B", "#B45309",
  `<rect x="6" y="6" width="24" height="24" rx="4" stroke-width="2.5"/>
   <rect x="12" y="12" width="12" height="12" rx="1.5" fill="#FFFFFF" fill-opacity="0.3"/>
   <path d="M12 2v4M18 2v4M24 2v4M12 30v4M18 30v4M24 30v4M2 12h4M2 18h4M2 24h4M30 12h4M30 18h4M30 24h4" stroke-width="2"/>`
);

// 3. DS - Data Structures Tree / Nodes (Emerald Green gradient)
const dsIcon = makeSvgDataUri(
  "#10B981", "#047857",
  `<circle cx="18" cy="6" r="4" fill="#FFFFFF"/>
   <circle cx="8" cy="26" r="4" fill="#FFFFFF"/>
   <circle cx="28" cy="26" r="4" fill="#FFFFFF"/>
   <path d="M15 9.5L10.5 22.5M21 9.5l4.5 13" stroke-width="2.5"/>`
);

// 4. SE - Software Engineering Code & Screen (Sky Blue gradient)
const seIcon = makeSvgDataUri(
  "#0EA5E9", "#0369A1",
  `<rect x="3" y="4" width="30" height="22" rx="3" stroke-width="2.5"/>
   <path d="M10 13l-3 2 3 2M16 13l3 2-3 2M11 26v4M7 30h12" stroke-width="2"/>`
);

// 5. DMS - Database Storage Disks (Blue gradient)
const dmsIcon = makeSvgDataUri(
  "#3B82F6", "#1D4ED8",
  `<ellipse cx="18" cy="8" rx="14" ry="5" stroke-width="2.5"/>
   <path d="M4 8v8c0 2.76 6.27 5 14 5s14-2.24 14-5V8" stroke-width="2.5"/>
   <path d="M4 16v8c0 2.76 6.27 5 14 5s14-2.24 14-5v-8" stroke-width="2.5"/>`
);

// 6. MDM - Mobile Device / Modern Database (Rose/Red gradient)
const mdmIcon = makeSvgDataUri(
  "#F43F5E", "#BE123C",
  `<rect x="8" y="2" width="20" height="32" rx="4" stroke-width="2.5"/>
   <circle cx="18" cy="28" r="1.5" fill="#FFFFFF"/>
   <line x1="15" y1="6" x2="21" y2="6" stroke-width="2"/>`
);

// 7. OP - Object Oriented Programming / 3D Cube (Purple gradient)
const opIcon = makeSvgDataUri(
  "#A855F7", "#6B21A8",
  `<path d="M18 3L5 10v16l13 7 13-7V10L18 3z" stroke-width="2.5"/>
   <path d="M5 10l13 7 13-7M18 17v16" stroke-width="2.5"/>`
);

// 8. FP - Functional Programming / Lambda (Teal gradient)
const fpIcon = makeSvgDataUri(
  "#14B8A6", "#0F766E",
  `<path d="M8 6h6l12 24M15 20l-7 10" stroke-width="3"/>
   <circle cx="27" cy="29" r="2" fill="#FFFFFF"/>`
);

const subjectIcons = {
  Maths: mathsIcon,
  DSMP: dsmpIcon,
  DS: dsIcon,
  SE: seIcon,
  DMS: dmsIcon,
  MDM: mdmIcon,
  OP: opIcon,
  FP: fpIcon
};

async function updateIcons() {
  console.log("Updating icons with distinct colors and shapes for Sem 3, Div E...");

  const updates = {};
  for (const [subj, iconLink] of Object.entries(subjectIcons)) {
    updates[`${subj}/iconLink`] = iconLink;
    updates[`${subj}/name`] = subj;
  }

  await db.ref("semesterList/3/divisionList/E/subjectMetaDataList").update(updates);
  console.log("✓ Successfully updated icons for all 8 subjects in Sem 3, Div E!");
  process.exit(0);
}

updateIcons().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
