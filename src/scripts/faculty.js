import { appState } from "./appstate.js";
import { getFacultyForClass } from "./appstate.js";
import { fadeInEffect, hideElement, showElement } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { showErrorSection } from "./error.js";

const DOM = {
  section: document.querySelector(".faculty-section"),
  subtitle: document.querySelector(".faculty-subtitle"),
  cardGrid: document.querySelector(".faculty-card-grid"),
  empty: document.querySelector(".faculty-empty"),
};

export async function loadFacultySection() {
  try {
    const sem = appState.activeSem;
    const div = appState.activeDiv;

    // Set header
    headerIcon.classList.add("bg-primary");
    headerIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    headerTitle.textContent = "Faculty";

    await hideSections();

    DOM.cardGrid.innerHTML = "";
    hideElement(DOM.empty);

    const faculty = await getFacultyForClass(sem, div);
    const entries = Object.entries(faculty || {});

    DOM.subtitle.textContent = `Sem ${sem} · Div ${div} · ${entries.length} teacher${entries.length !== 1 ? "s" : ""}`;

    if (!entries.length) {
      showElement(DOM.empty);
      DOM.empty.style.display = "flex";
      await fadeInEffect(DOM.section);
      return;
    }

    entries.forEach(([, teacher]) => {
      const card = createFacultyCard(teacher);
      DOM.cardGrid.appendChild(card);
    });

    await fadeInEffect(DOM.section);
  } catch (err) {
    showErrorSection("Error loading faculty:", err);
  }
}

function createFacultyCard(teacher) {
  const card = document.createElement("div");
  card.className =
    "bg-surface-2 border border-surface-3 flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-200 hover:bg-surface-3 hover:shadow-md";

  // Avatar
  const avatarWrapper = document.createElement("div");
  avatarWrapper.className = "relative";

  const img = document.createElement("img");
  img.src =
    teacher.pfpLink ||
    "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png";
  img.alt = `${teacher.firstName} ${teacher.lastName}`;
  img.className =
    "h-16 w-16 rounded-full object-cover ring-2 ring-primary/30 ring-offset-2 ring-offset-surface-2";

  // Badge
  const badge = document.createElement("div");
  badge.className =
    "bg-primary text-on-primary absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider";
  badge.textContent = "Teacher";

  avatarWrapper.appendChild(img);
  avatarWrapper.appendChild(badge);

  // Name
  const name = document.createElement("div");
  name.className = "flex flex-col gap-0.5 mt-1";

  const firstName = document.createElement("p");
  firstName.className = "text-text-primary font-semibold text-sm leading-tight";
  firstName.textContent = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();

  name.appendChild(firstName);

  // Subjects (if assignedClasses shows multiple entries, list them)
  const classes = teacher.assignedClasses
    ? Object.keys(teacher.assignedClasses).join(", ")
    : "";
  if (classes) {
    const classTag = document.createElement("p");
    classTag.className = "text-text-tertiary text-xs";
    classTag.textContent = classes;
    name.appendChild(classTag);
  }

  card.appendChild(avatarWrapper);
  card.appendChild(name);
  return card;
}
