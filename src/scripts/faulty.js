import { appState, getFaultyForClass } from "./appstate.js";
import { fadeInEffect, fadeOutEffect, hideElement, showElement } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { showErrorSection } from "./error.js";

const DOM = {
  section: document.querySelector(".faulty-section"),
  subtitle: document.querySelector(".faulty-subtitle"),
  faultyGrid: document.querySelector(".faulty-grid"),
  empty: document.querySelector(".faulty-empty"),
};

let activeSem = null;

export async function loadFaultySection() {
  try {
    activeSem = appState.activeSem;
    const div = appState.activeDiv;

    // Set header
    headerIcon.classList.add("bg-primary");
    headerIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>`;
    headerTitle.textContent = "Faulty";

    await hideSections();
    await renderFaultyItems(activeSem, div);
    await fadeInEffect(DOM.section);
  } catch (err) {
    showErrorSection("Error loading faulty section:", err);
  }
}

async function renderFaultyItems(sem, div) {
  DOM.faultyGrid.innerHTML = "";
  hideElement(DOM.empty);

  // Get faulty items from database
  const faultyItems = await getFaultyForClass(sem, div);
  const faultyEntries = Object.entries(faultyItems || {});

  DOM.subtitle.textContent = `Sem ${sem} · Div ${div} · ${faultyEntries.length} item${faultyEntries.length !== 1 ? "s" : ""}`;

  if (!faultyEntries.length) {
    showElement(DOM.empty);
    DOM.empty.style.display = "flex";
    return;
  }

  faultyEntries.forEach(([, item]) => {
    const card = createFaultyCard(item);
    DOM.faultyGrid.appendChild(card);
  });
}

function createFaultyCard(item) {
  const wrapper = document.createElement("a");
  wrapper.href = item.link || "#";
  wrapper.target = "_blank";
  wrapper.rel = "noopener noreferrer";
  wrapper.className = "group flex flex-col gap-2 cursor-pointer";

  // Card
  const card = document.createElement("div");
  card.className = "bg-surface-2 relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl p-4 shadow-md transition-all duration-200 group-hover:scale-[1.03] group-hover:shadow-xl";

  // Icon
  card.innerHTML = `
    <div class="flex flex-col items-center gap-2">
      <i class="fa-solid fa-file-lines text-4xl text-text-secondary"></i>
      <p class="text-text-primary text-sm font-bold leading-tight line-clamp-2 text-center">${escHtml(item.name || "Untitled")}</p>
    </div>
    <i class="fa-solid fa-arrow-up-right-from-square absolute top-3 right-3 text-text-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
  `;

  // Info below card
  const info = document.createElement("div");
  info.className = "flex flex-col gap-0.5 px-1";

  const title = document.createElement("p");
  title.className = "text-text-primary text-sm font-semibold truncate";
  title.textContent = item.name || "Untitled";

  if (item.description) {
    const description = document.createElement("p");
    description.className = "text-text-secondary text-xs truncate";
    description.textContent = item.description;
    info.appendChild(title);
    info.appendChild(description);
  } else {
    info.appendChild(title);
  }

  wrapper.appendChild(card);
  wrapper.appendChild(info);
  return wrapper;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
