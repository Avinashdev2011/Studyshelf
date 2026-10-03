import { initRouting } from "./index.js";
import {
  fadeInEffect,
  fadeInEffectOpacity,
  fadeOutEffect,
} from "./animation.js";
import { trackTimeTable } from "./posthog.js";
import { timeTablePopupSwiper } from "./dashboard.js";
const sideBarContent = document.querySelector(".side-bar-content");
import { appState } from "./appstate.js";
export const sideBar = document.querySelector("nav");
export let activeNavIcon = null;
const slider = document.querySelector(".slider");
export const subjectSelectorPopup = document.querySelector(
  ".subject-selector-popup",
);
const subjectSelectorCardWrapper = document.querySelector(
  ".subject-selector-popup .card-wrapper",
);
export const header = document.querySelector("header");
export const headerIcon = document.querySelector(".header-icon");
export const headerTitle = document.querySelector(".header-title");
export function setActiveNavIcon(newIcon) {
  if (!newIcon) return;
  if (activeNavIcon) {
    activeNavIcon.classList.remove("activeIcon");
    activeNavIcon.setAttribute("fill", "#8D9DA6");
  }
  newIcon.classList.add("activeIcon");
  newIcon.setAttribute("fill", "#ffffff");
  activeNavIcon = newIcon;
  const iconWrapper = newIcon.closest(".icon-wrapper");
  const navRect = sideBarContent.getBoundingClientRect();
  const iconRect = iconWrapper.getBoundingClientRect();
  const isLgScreen = window.innerWidth >= 1024;
  if (isLgScreen) {
    const translateY =
      iconRect.top -
      navRect.top +
      iconWrapper.offsetHeight / 2 -
      slider.offsetHeight / 2 -
      12;
    slider.style.transform = `translateY(${translateY}px)`;
  } else {
    const translateX =
      iconRect.left -
      navRect.left +
      iconWrapper.offsetWidth / 2 -
      slider.offsetWidth / 2 -
      1.5;
    slider.style.transform = `translateX(${translateX}px)`;
  }
}
export const dashboardIcon = document.querySelector(".home-icon");
export const subjectIcon = document.querySelector(".subject-icon");
export const timeTableIcon = document.querySelector(".timetable-icon");
const timetablePopup = document.querySelector(".time-table-popup-wrapper");
export const personalFolderIcon = document.querySelector(
  ".personal-folder-icon",
);
dashboardIcon.addEventListener("click", (e) => {
  history.pushState({}, "", "/?dashboard=''");
  initRouting();
});
timeTableIcon.addEventListener("click", async () => {
  await fadeInEffect(timetablePopup);
  timeTablePopupSwiper.slideTo(0, 0);
  timeTablePopupSwiper.update();
  trackTimeTable(
    appState.currentSemester,
    appState.currentDivision,
    "Opened timetable",
  );
});
personalFolderIcon.addEventListener("click", () => {
  history.pushState({}, "", '?personal-folder=""');
  initRouting();
});
export function loadSubjectSelectionList() {
  subjectSelectorCardWrapper.innerHTML = "";
  const meta = appState.subjectMetaData || {};
  const keys = Object.keys(meta);
  if (keys.length === 0) {
    const emptyP = document.createElement("p");
    emptyP.className =
      "text-text-secondary text-xs p-3 text-center w-36 whitespace-normal";
    emptyP.textContent = "No subjects found";
    subjectSelectorCardWrapper.appendChild(emptyP);
    return;
  }
  for (const key in meta) {
    const subject = meta[key];
    if (!subject) continue;

    const subjectCard = document.createElement("div");
    subjectCard.className =
      "subject-card w-28 bg-surface-2 flex px-3 py-2 rounded-md justify-start items-center gap-4 transition-all duration-200 cursor-pointer hover:bg-surface-3";

    const img = document.createElement("img");
    img.src = subject.iconLink;
    img.className = "w-8 h-8";
    img.alt = "";

    const text = document.createElement("p");
    text.className = "font-semibold";
    text.textContent = subject.name;
    subjectCard.appendChild(img);
    subjectCard.appendChild(text);
    subjectCard.addEventListener("click", () => {
      history.pushState({}, "", `?subject=${subject.name}`);
      fadeOutEffect(subjectSelectorPopup);
      initRouting();
    });
    subjectSelectorCardWrapper.appendChild(subjectCard);
  }
}
document.addEventListener("click", (e) => {
  const icon = e.target.closest(".subject-icon");
  if (
    subjectSelectorPopup.classList.contains("hidden") &&
    icon === subjectIcon
  ) {
    {
      fadeInEffect(subjectSelectorPopup);
      if (window.innerWidth <= 1024) {
        const rect = subjectIcon.getBoundingClientRect();
        const f = rect.left;
        subjectSelectorPopup.style.left = `${f}px`;
      }
    }
  } else fadeOutEffect(subjectSelectorPopup);
});
let lastScrollY = window.scrollY;
function handleScroll() {
  if (window.innerWidth < 1024) {
    if (window.scrollY > lastScrollY) {
      sideBar.style.transform = "translateY(160%)";
      fadeOutEffect(subjectSelectorPopup);
    } else {
      sideBar.style.transform = "translateY(0)";
    }
  } else {
    sideBar.style.transform = "translateY(0)"; //
  }
  lastScrollY = window.scrollY;
}
window.addEventListener("scroll", handleScroll);
