import {
  app,
  auth,
  onAuthStateChanged,
  signOutUser,
  setUserId,
  analytics,
  logEvent,
} from "./firebase.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import { showDashboard, loadDashboard } from "./dashboard.js";
import {
  headerIcon,
  headerTitle,
  header,
  setActiveNavIcon,
  dashboardIcon,
  subjectIcon,
  loadSubjectSelectionList,
  timeTableIcon,
  sideBar,
  subjectSelectorPopup,
  personalFolderIcon,
} from "./navigation.js";
import { loadSubjectSection } from "./subject.js";
import {
  loginSection,
  showLoginSection,
  showResetPasswordSection,
  toggleFormState,
  resetForm,
} from "./login.js";
import { initAdminRouting } from "./admin.js";
import {
  appState,
  initAppState,
  getUserData,
  adminAppState,
  syncDbData,
} from "./appstate.js";
import { isOffline, sentaryInit, showErrorSection } from "./error.js";
import {
  trackLoginUser,
  trackClass,
  trackPage,
  trackSubjectPage,
  trackUserLogout,
  resetPostHog,
} from "./posthog.js";
import {
  requestNotificationPermission,
  showStoredNotification,
} from "./notification.js";
import { initTheme, loadThemeOptions } from "./theme.js";
import { loadPersonalFolderSection } from "./personalFolder.js";
export const lottieLoadingScreen = document.querySelector(
  ".lottie-loading-screen",
);
const lottieLoader = document.querySelector("#lottie-loader");
const sectionLoader = document.querySelector(".task-loader-wrapper");
const sectionLoaderMessage = sectionLoader.querySelector(".loader-status");
export const editModeToggleButton = document.querySelector(
  ".edit-mode-toggle-btn",
);
const confirmationPopup = document.querySelector(".confirmation-popup-wrapper");
const confirmationDescription = confirmationPopup.querySelector(".description");
const confirmationTitle = confirmationPopup.querySelector(".title");
const confirmButton = confirmationPopup.querySelector(".confirm-btn");
const cancelButton = confirmationPopup.querySelector(".cancel-btn");
const personalFolderEditModeToggleButton = document.querySelector(
  ".personal-folder-edit-mode-toggle-btn",
);
let authStateInitialized = false;
export let localUserData = {
  userData: undefined,
  isVisitingClass: false,
};
const selectClassPopup = document.querySelector(".select-class-popup-wrapper");
const selectClassPopupCloseButton =
  selectClassPopup.querySelector(".close-popup-btn");
const selectClassCardContainer =
  selectClassPopup.querySelector(".card-container");
export async function showSelectClassPopup(user) {
  selectClassCardContainer.innerHTML = "";
  const classList = user.assignedClasses;
  if (Object.keys(classList).length === 1) {
    const [sem, div] = Object.keys(classList)[0].split("");
    localUserData.userData = user;
    localUserData.userData.class = `${sem}${div}`;
    hideSectionLoader();
    initClass();
    return;
  }
  const numMap = {
    1: "FYCO",
    2: "FYCO",
    3: "SYCO",
    4: "SYCO",
    5: "TYCO",
    6: "TYCO",
  };
  for (const key in classList) {
    const semesterNum = key[0];
    const division = key[1];
    const card = document.createElement("div");
    card.className =
      "bg-surface-3 w-full rounded-[1.25rem] p-4 text-center cursor-pointer custom-hover";
    card.setAttribute("semester", semesterNum);
    card.setAttribute("division", division);
    card.innerHTML = `${numMap[semesterNum]}-${division}`;
    selectClassCardContainer.appendChild(card);

    card.addEventListener("click", async () => {
      fadeOutEffect(selectClassPopup);
      localUserData.userData = user;
      localUserData.userData.class = `${semesterNum}${division}`;
      initClass();
    });
  }

  await hideSectionLoader();
  fadeInEffect(selectClassPopup);
}

selectClassPopupCloseButton.addEventListener("click", async () => {
  await isOffline();
  await showSectionLoader("Loading...", false);
  await toggleFormState(false);
  hideElement(selectClassPopup);
  await signOutUser();
  await hideSectionLoader();
  await showLoginSection();
});
export let isNewUser = { flag: false };
export async function showSectionLoader(
  message = "Loading...",
  isBlur = true,
  duration = 200,
) {
  if (!isBlur) {
    sectionLoader.classList.remove("bg-[#00000080]", "backdrop-blur-xs");
    sectionLoader.classList.add("bg-surface-1");
  } else {
    sectionLoader.classList.remove("bg-surface-1");
    sectionLoader.classList.add("bg-[#00000080]", "backdrop-blur-xs");
  }
  sectionLoader.style.transitionDuration = `${duration}ms`;
  sectionLoaderMessage.textContent = message;
  await fadeInEffect(sectionLoader);
}
export async function hideSectionLoader(duration = 200) {
  sectionLoader.style.transitionDuration = `${duration}ms`;
  await fadeOutEffect(sectionLoader);
}
async function loadContent() {
  await loadSubjectSelectionList();
  await loadDashboard();
}
export async function showConfirmationPopup(
  description = "This action cannot be undone.",
  title = "Are you sure?",
) {
  return new Promise((resolve) => {
    confirmationTitle.textContent = title;
    confirmationDescription.textContent = description;
    fadeInEffect(confirmationPopup);
    confirmButton.addEventListener("click", async () => {
      await fadeOutEffect(confirmationPopup);
      resolve(true);
    });
    cancelButton.addEventListener("click", async () => {
      await fadeOutEffect(confirmationPopup);
      resolve(false);
    });
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await isOffline();
    resetPostHog();
    showSectionLoader("Loading...", false);
    onAuthStateChanged(auth, async (userCredential) => {
      if (authStateInitialized || isNewUser.flag) return;
      try {
        if (userCredential) {
          const user = await getUserData(userCredential.uid);
          initTheme(user.theme);
          trackLoginUser(userCredential.uid, user.email);
          sentaryInit(user.email, `${user.firstName} ${user.lastName}`);
          if (user.role === "teacher") {
            showSelectClassPopup(user);
            return;
          }
          if (user.role === "admin") {
            showSectionLoader("Loading...", false, 200);
            localUserData.userData = user;
            initAdminRouting(user);
            resetForm();
            return;
          }
          localUserData.userData = user;
          hideSectionLoader();
          initClass();
        } else {
          document.body.classList.remove("is-admin");
          localUserData.userData = null;
          localUserData.isVisitingClass = false;
          if (adminAppState) {
            adminAppState.userData = null;
            adminAppState.userId = null;
          }
          if (appState) {
            appState.userData = null;
            appState.role = null;
            appState.isEditing = false;
          }

          // Close all open popups/overlays
          const popupsToHide = [
            document.querySelector(".menu-popup-wrapper"),
            document.querySelector(".account-details-popup-wrapper"),
            document.querySelector(".pfp-selection-popup-wrapper"),
            document.querySelector(".select-class-popup-wrapper"),
            document.querySelector(".subject-selector-popup-wrapper"),
            document.querySelector(".pick-teacher-popup-wrapper"),
            document.querySelector(".add-user-link-popup-wrapper"),
            document.querySelector(".individual-user-popup-wrapper"),
            document.querySelector(".class-code-popup-wrapper"),
            document.querySelector(".theme-popup-wrapper"),
            document.querySelector(".lottie-loading-screen"),
          ];
          popupsToHide.forEach((p) => {
            if (p) hideElement(p);
          });

          await hideSectionLoader();
          await showLoginSection();
        }
      } catch (error) {
        showErrorSection("Error during authentication state change:", error);
      }
    });
  } catch (error) {
    showErrorSection("Error during initialization:", error);
  }
});
export async function initClass() {
  try {
    fadeInEffect(lottieLoadingScreen);
    const userPfp = document.querySelectorAll(".user-pfp");
    userPfp.forEach((pfp) => {
      pfp.src = localUserData.userData.pfpLink;
    });
    if (localUserData.userData?.role !== "admin" && appState.role !== "admin") {
      document.body.classList.remove("is-admin");
    } else {
      document.body.classList.add("is-admin");
    }
    const [Semester, Division] = localUserData.userData.class.split("");
    await initAppState(localUserData.userData, Semester, Division);
    await fadeInEffect(lottieLoadingScreen);
    if (
      localUserData.userData.role === "admin" ||
      localUserData.userData.role === "teacher" ||
      localUserData.userData.role === "editor"
    )
      showElement(editModeToggleButton);
    else hideElement(editModeToggleButton);

    await hideSections();
    await loadContent();
    await applyEditModeUI();
    trackClass(Semester, Division);
    resetForm();
    requestNotificationPermission();
    showStoredNotification();
    loadThemeOptions();

    initRouting();
  } catch (error) {
    showErrorSection("Error initializing class:", error);
  }
}
export async function initRouting() {
  const params = new URLSearchParams(window.location.search);
  if (
    !auth.currentUser ||
    !localUserData.userData ||
    window.location.search.includes("login")
  ) {
    document.body.classList.remove("is-admin");
    history.replaceState({}, "", "/?login=''");
    await hideSections(false, false, false, false);
    showLoginSection();
    return;
  }
  const dashboard = params.get("dashboard");
  const activeSubject = params.get("subject");
  const pyq = params.get("pyq");
  const personalFolder = params.get("personal-folder");
  hideElement(personalFolderEditModeToggleButton);
  if (window.location.href.includes("login")) {
    await hideSections(false, false, false, false);
    trackPage(appState.activeSem, appState.activeDiv, "Login");
    showLoginSection();
  } else if (dashboard) {
    setActiveNavIcon(dashboardIcon);
    trackPage(appState.activeSem, appState.activeDiv, "Dashboard");
    await showDashboard();
    if (
      localUserData.userData?.role === "admin" ||
      localUserData.isVisitingClass ||
      adminAppState.userData?.role === "admin"
    ) {
      const adminReturnBtn = document.querySelector(".admin-return-btn");
      if (adminReturnBtn) showElement(adminReturnBtn);
    }
    await fadeOutEffect(lottieLoadingScreen);
  } else if (activeSubject) {
    const semParam = params.get("sem");
    const divParam = params.get("div");
    if (
      semParam &&
      divParam &&
      (appState.activeSem !== semParam || appState.activeDiv !== divParam)
    ) {
      appState.activeSem = semParam;
      appState.activeDiv = divParam;
      await syncDbData();
    }
    appState.activeSubject = activeSubject;
    trackSubjectPage(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
    );
    setActiveNavIcon(subjectIcon);
    await loadSubjectSection();
    if (
      localUserData.userData?.role === "admin" ||
      localUserData.userData?.role === "teacher" ||
      appState.role === "admin" ||
      appState.role === "teacher"
    ) {
      showElement(editModeToggleButton);
      if (appState.isEditing) {
        editModeToggleButton.textContent = "Exit editing";
      } else {
        editModeToggleButton.textContent = "Edit";
      }
      const adminReturnBtn = document.querySelector(".admin-return-btn");
      if (adminReturnBtn) {
        showElement(adminReturnBtn);
      }
    }
    await applyEditModeUI();
    await fadeOutEffect(lottieLoadingScreen);
  } else if (personalFolder) {
    if (window.innerWidth >= 1024) {
      setActiveNavIcon(personalFolderIcon);
    } else {
      setActiveNavIcon(dashboardIcon);
    }
    await fadeOutEffect(lottieLoadingScreen);
    trackPage(appState.activeSem, appState.activeDiv, "Personal Folder");
    await loadPersonalFolderSection();
  } else if (pyq) {
    await fadeOutEffect(lottieLoadingScreen);
    trackPage(
      appState.activeSem,
      appState.activeDiv,
      "Previous Year Questions",
    );
    showPyq();
  } else {
    history.pushState({}, "", "/?dashboard=''");
    setActiveNavIcon(dashboardIcon);
    trackPage(appState.activeSem, appState.activeDiv, "Dashboard");
    await showDashboard();
    await fadeOutEffect(lottieLoadingScreen);
  }
}
export async function hideSections(
  showHeaderIcon = true,
  showHeaderTitle = true,
  showSidebar = true,
  showHeader = true,
) {
  const urlParams = new URLSearchParams(window.location.search);
  const isSubjectPage = Boolean(urlParams.get("subject"));
  const isDashboard = Boolean(urlParams.get("dashboard"));
  const isPersonalFolder = Boolean(urlParams.get("personal-folder"));
  const isPyq = Boolean(urlParams.get("pyq"));
  const isVisitingClassOrContent =
    isSubjectPage || isDashboard || isPersonalFolder || isPyq || localUserData.isVisitingClass;

  const isUserAdmin =
    Boolean(
      auth.currentUser &&
      (localUserData.userData?.role === "admin" ||
       appState.role === "admin" ||
       adminAppState.userData?.role === "admin")
    );

  if (isUserAdmin && showHeader) {
    showSidebar = false;
    showHeader = true;
    showHeaderTitle = true;
    showHeaderIcon = true;
    document.body.classList.add("is-admin");
  } else if (!isUserAdmin) {
    document.body.classList.remove("is-admin");
  }

  // Top Bar (Header) visibility
  if (showHeader) {
    header.classList.remove("hidden");
    await showElement(header);
  } else {
    await hideElement(header);
  }

  if (showHeaderIcon) {
    headerIcon.classList.remove("hidden");
    await showElement(headerIcon);
  } else {
    await hideElement(headerIcon);
  }

  if (showHeaderTitle) {
    headerTitle.classList.remove("hidden");
    headerTitle.style.display = "flex";
    await showElement(headerTitle);
  } else {
    await hideElement(headerTitle);
  }

  // Sidebar visibility
  if (!showSidebar || (isUserAdmin && showHeader)) {
    document.querySelector("main").classList.remove("lg:ml-[4.375rem]");
    await hideElement(sideBar);
  } else {
    document.querySelector("main").classList.add("lg:ml-[4.375rem]");
    await showElement(sideBar);
  }

  const allSections = document.querySelectorAll("section");
  const adminBtnWrapper = document.querySelector(".admin-btn-wrapper");
  const adminReturnBtn = document.querySelector(".admin-return-btn");
  const visitClassRoomBtn = document.querySelector(".visit-class-room-btn");
  const adminSection = document.querySelector(".admin-section");
  const classRoom = document.querySelector(".class-room");
  const divisionList = document.querySelector(".division-list");

  if (adminReturnBtn) hideElement(adminReturnBtn);

  if (!showHeader) {
    if (adminBtnWrapper) hideElement(adminBtnWrapper);
    if (adminReturnBtn) hideElement(adminReturnBtn);
    if (visitClassRoomBtn) hideElement(visitClassRoomBtn);
    if (adminSection) hideElement(adminSection);
    if (classRoom) hideElement(classRoom);
    if (divisionList) hideElement(divisionList);
  } else if (isVisitingClassOrContent) {
    if (adminSection) hideElement(adminSection);
    if (classRoom) hideElement(classRoom);
    if (divisionList) hideElement(divisionList);
    if (visitClassRoomBtn) hideElement(visitClassRoomBtn);
    if (
      localUserData.userData?.role === "admin" ||
      adminAppState.userData?.role === "admin"
    ) {
      if (adminBtnWrapper) {
        adminBtnWrapper.classList.remove("hidden");
        showElement(adminBtnWrapper);
      }
      if (adminReturnBtn) {
        adminReturnBtn.classList.remove("hidden");
        showElement(adminReturnBtn);
      }
    }
  } else if (isUserAdmin) {
    if (adminBtnWrapper) {
      adminBtnWrapper.classList.remove("hidden");
      showElement(adminBtnWrapper);
    }
  } else {
    if (adminBtnWrapper) hideElement(adminBtnWrapper);
  }

  hideElement(subjectSelectorPopup);
  for (const section of allSections) {
    await hideElement(section);
  }
}
editModeToggleButton.addEventListener("click", () => {
  appState.isEditing = !appState.isEditing;
  if (appState.isEditing) {
    editModeToggleButton.textContent = "Exit editing";
    applyEditModeUI();
  } else {
    editModeToggleButton.textContent = "Edit";
    applyEditModeUI();
  }
});
const adminReturnBtn = document.querySelector(".admin-return-btn");
if (adminReturnBtn) {
  adminReturnBtn.addEventListener("click", () => {
    hideElement(adminReturnBtn);
    hideElement(editModeToggleButton);
    localUserData.isVisitingClass = false;
    const targetDiv = appState.activeDiv || adminAppState.activeDiv || "E";
    const targetSem = appState.activeSem || adminAppState.activeSem || "1";
    adminAppState.activeSem = targetSem;
    adminAppState.activeDiv = targetDiv;
    history.pushState({}, "", `/?div=${encodeURIComponent(targetDiv)}&sem=${targetSem}`);
    initAdminRouting(adminAppState.userData || localUserData.userData);
  });
}
export async function applyEditModeUI() {
  const editorTool = document.querySelectorAll(".editor-tool");
  const editorOnlyContent = document.querySelectorAll(".editor-only-content");
  const editorOnlyContentCard = document.querySelectorAll(
    ".editor-only-content-card",
  );
  const subjectSectionUpcomingSubmissions = document.querySelector(
    ".subject-page-section .upcoming-submissions",
  );
  const editorMousePointer = document.querySelectorAll(".editor-hover-pointer");
  if (appState.isEditing) {
    editorOnlyContent.forEach((content) => showElement(content));
    editorMousePointer.forEach((element) => {
      element.style.cursor = "pointer";
    });
    editorOnlyContentCard.forEach((card) => {
      const wrapper = card.closest("a");
      if (wrapper?.classList.contains("hidden")) {
        showElement(wrapper);
      }
      showElement(card);
      if (card.classList.contains("visiblity-hidden")) {
        card.style.opacity = "0.5";
      }
    });
    editorTool.forEach(async (tool) => showElement(tool));
    editModeToggleButton.textContent = "Exit editing";
    if (appState?.userData?.role !== "admin") {
      showElement(subjectSectionUpcomingSubmissions);
    } else {
      hideElement(subjectSectionUpcomingSubmissions);
    }
  } else {
    const submissions =
      (appState.divisionData?.upcomingSubmissionData || {})[
        appState.activeSubject
      ] || {};
    if (!submissions || !Object.keys(submissions).length) {
      hideElement(subjectSectionUpcomingSubmissions);
    }
    editorOnlyContent.forEach((content) => hideElement(content));
    editorMousePointer.forEach((element) => {
      element.style.cursor = "default";
    });
    editorOnlyContentCard.forEach((card) => {
      hideElement(card);
      const wrapper = card.closest("a");
      if (wrapper) hideElement(wrapper);
    });
    editorTool.forEach((tool) => hideElement(tool));
    editModeToggleButton.textContent = "Edit";
  }
}
window.addEventListener("popstate", () => {
  if (
    !auth.currentUser ||
    !localUserData.userData ||
    window.location.search.includes("login")
  ) {
    document.body.classList.remove("is-admin");
    history.replaceState({}, "", "/?login=''");
    showLoginSection();
    return;
  }
  if (
    localUserData.userData.role &&
    localUserData.userData.role === "admin" &&
    !localUserData.isVisitingClass
  ) {
    initAdminRouting();
  } else {
    initRouting();
  }
});

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/firebase-messaging-sw.js")
//     .then((registration) => {
//       console.log("Service Worker registered successfully:", registration);
//     })
//     .catch((error) => {
//       console.error("Service Worker registration failed:", error);
//     });
// }
