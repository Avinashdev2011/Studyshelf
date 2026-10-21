import { appState } from "./appstate.js";
import { getEBooksForClass } from "./appstate.js";
import { getFileTypeDetails } from "./driveApi.js";
import { fadeInEffect, fadeOutEffect, hideElement, showElement } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { showErrorSection } from "./error.js";

const DOM = {
  section: document.querySelector(".library-section"),
  subtitle: document.querySelector(".library-subtitle"),
  semPills: document.querySelector(".library-sem-pills"),
  bookGrid: document.querySelector(".library-book-grid"),
  empty: document.querySelector(".library-empty"),
};

// Preset cover colours cycling through the theme palette
const COVER_COLORS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-700",
];

let activeSem = null;

export async function loadLibrarySection() {
  try {
    activeSem = appState.activeSem;
    const div = appState.activeDiv;

    // Set header
    headerIcon.classList.add("bg-primary");
    headerIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
    headerTitle.textContent = "Library";

    await hideSections();
    renderSemPills(div);
    await renderBooks(activeSem, div);
    await fadeInEffect(DOM.section);
  } catch (err) {
    showErrorSection("Error loading library:", err);
  }
}

function renderSemPills(div) {
  DOM.semPills.innerHTML = "";
  const semesters = appState.semesterData
    ? Object.keys(appState.semesterData).sort((a, b) => Number(a) - Number(b))
    : [appState.activeSem];

  // Always show at least the current sem
  const semList = semesters.length ? semesters : [appState.activeSem];

  semList.forEach((sem) => {
    const btn = document.createElement("button");
    const isActive = String(sem) === String(activeSem);
    btn.className = `px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
      isActive
        ? "bg-primary text-on-primary"
        : "bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-surface-3"
    }`;
    btn.textContent = `Sem ${sem}`;
    btn.addEventListener("click", async () => {
      if (String(activeSem) === String(sem)) return;
      activeSem = String(sem);
      renderSemPills(div);
      await renderBooks(activeSem, div);
    });
    DOM.semPills.appendChild(btn);
  });
}

async function renderBooks(sem, div) {
  DOM.bookGrid.innerHTML = "";
  hideElement(DOM.empty);

  const books = await getEBooksForClass(sem, div);
  const bookEntries = Object.entries(books || {});

  DOM.subtitle.textContent = `Sem ${sem} · Div ${div} · ${bookEntries.length} book${bookEntries.length !== 1 ? "s" : ""}`;

  if (!bookEntries.length) {
    showElement(DOM.empty);
    DOM.empty.style.display = "flex";
    return;
  }

  bookEntries.forEach(([, book]) => {
    DOM.bookGrid.appendChild(createBookCard(book));
  });
}

function createBookCard(book) {
  const { fileIcon } = getFileTypeDetails(book);

  const wrapper = document.createElement("a");
  wrapper.href = book.link || "#";
  wrapper.target = "_blank";
  wrapper.rel = "noopener noreferrer";
  wrapper.className = "w-full";

  const card = document.createElement("div");
  card.className =
    "card bg-surface-2 hover:bg-surface-3 rounded-2xl flex items-center justify-between gap-3 p-3.5 px-4 w-full cursor-pointer transition-colors";

  const left = document.createElement("div");
  left.className = "flex items-center gap-3 min-w-0 flex-1";

  const iconBox = document.createElement("div");
  iconBox.className =
    "w-9 h-9 rounded-lg bg-surface-1 shrink-0 flex items-center justify-center";
  iconBox.innerHTML = `<i class="${fileIcon} text-lg"></i>`;

  const infoCol = document.createElement("div");
  infoCol.className = "flex flex-col min-w-0";

  const titleEl = document.createElement("span");
  titleEl.className = "font-medium text-text-primary text-sm leading-snug truncate";
  titleEl.textContent = book.name || "Untitled";
  infoCol.appendChild(titleEl);

  if (book.author) {
    const authorEl = document.createElement("span");
    authorEl.className = "text-xs text-text-secondary truncate";
    authorEl.textContent = book.author;
    infoCol.appendChild(authorEl);
  }

  left.appendChild(iconBox);
  left.appendChild(infoCol);

  const openIcon = document.createElement("i");
  openIcon.className =
    "fa-solid fa-arrow-up-right-from-square text-text-tertiary text-sm shrink-0";

  card.appendChild(left);
  card.appendChild(openIcon);
  wrapper.appendChild(card);
  return wrapper;
}

function getFileLabel(book) {
  const ft = (book.fileType || "").toLowerCase();
  if (ft === "pdf") return "PDF";
  if (["ppt", "pptx"].includes(ft)) return "PPT";
  if (["doc", "docx"].includes(ft)) return "DOC";
  if (book.attachmentId && book.attachmentId !== "custom-link") return "FILE";
  return "LINK";
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
