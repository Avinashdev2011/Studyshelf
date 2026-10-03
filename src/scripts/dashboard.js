import { appState, syncDbData } from "./appstate.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import {
  hideSections,
  showSectionLoader,
  hideSectionLoader,
  showConfirmationPopup,
  applyEditModeUI,
  initRouting,
  showSelectClassPopup,
} from "./index.js";
import { initAdminRouting } from "./admin.js";
import { deleteDriveFile, uploadDriveFile } from "./driveApi.js";
import { header, headerIcon, headerTitle } from "./navigation.js";
import { pfpSelectionPopup } from "./avatars.js";
import {
  app,
  pushData,
  get,
  ref,
  db,
  updateData,
  deleteData,
  signOutUser,
  set,
} from "./firebase.js";
import { renderNoticeSlider as subjectRenderNoticeSlider } from "./subject.js";
import { showErrorSection } from "./error.js";
import { sendNotification, unsubscribeFCM } from "./notification.js";
const dashboardSection = document.querySelector(".dashboard-section");
const pfpElement = document.createElement("img");
pfpElement.className = "h-full w-full";
export const timeTablePopupSwiper = new Swiper("#time-table-popup-swiper", {
  direction: "horizontal",
  loop: true,
  slidesPerView: 1,
  spaceBetween: 30,
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
const DOM = {
  dashboardSection: document.querySelector(".dashboard-section"),
  sendNotificationBtn: document.querySelector(
    ".dashboard-section .send-notification-btn",
  ),
  addNoticeBtn: document.querySelector(".dashboard-section .add-notice-btn"),
  navPfp: document.querySelector(".navigation-user-pfp"),
  themeBtn: document.querySelector(".theme-btn"),
  smThemeBtn: document.querySelector(".sm-theme-btn"),
  upcomingSubmissions: {
    container: document.querySelector(
      ".dashboard-section .upcoming-submissions",
    ),
    cardContainer: document.querySelector(
      ".dashboard-section .upcoming-submissions .card-container",
    ),
  },
  sendNotification: {
    popup: document.querySelector(
      ".dashboard-section .send-notification-popup-wrapper",
    ),
    popupTitle: document.querySelector(
      ".dashboard-section .send-notification-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".dashboard-section .send-notification-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".dashboard-section .send-notification-popup-wrapper .success-btn",
    ),
    fakeScopePlaceholder: document.querySelector(
      ".dashboard-section .send-notification-popup-wrapper .scope-placeholder",
    ),
    inputs: {
      title: document.querySelector("#dashboard-section-notification-title"),
      description: document.querySelector(
        "#dashboard-section-notification-description",
      ),
      scope: document.querySelector(
        "#dashboard-section-notification-scope-input",
      ),
    },
    errors: {
      title: document.querySelector(
        ".dashboard-section .send-notification-popup-wrapper .title-error",
      ),
      description: document.querySelector(
        ".dashboard-section .send-notification-popup-wrapper .description-error",
      ),
      scope: document.querySelector(
        ".dashboard-section .send-notification-popup-wrapper .scope-error",
      ),
    },
  },

  warningPopup: {
    popup: document.querySelector(".dashboard-section .warning-popup-wrapper"),
    successBtn: document.querySelector(
      ".dashboard-section .warning-popup-wrapper .success-btn",
    ),
    message: document.querySelector(
      ".dashboard-section .warning-popup-wrapper .message",
    ),
  },
  timeTableSwiper: {
    swiper: new Swiper("#time-table-swiper", {
      direction: "horizontal",
      loop: true,
      slidesPerView: 1,
      spaceBetween: 30,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    }),

    batchToggleBtn: document.querySelector(
      ".dashboard-section .batchToggleBtn",
    ),
  },
  timeTablePopupSwiper: {
    popup: document.querySelector(".time-table-popup-wrapper"),
    closeBtn: document.querySelector(
      ".time-table-popup-wrapper .close-popup-btn",
    ),
    batchToggleBtn: document.querySelector(
      ".time-table-popup-wrapper .batchToggleBtn",
    ),
  },
  timeTablePopup: {
    popup: document.querySelector(".add-time-table-popup-wrapper"),
    successBtn: document.querySelector(
      ".add-time-table-popup-wrapper .success-btn",
    ),
    closeBtn: document.querySelector(
      ".add-time-table-popup-wrapper .close-popup-btn",
    ),
    deleteBtn: document.querySelector(
      ".add-time-table-popup-wrapper .delete-btn",
    ),
    popupTitle: document.querySelector(
      ".add-time-table-popup-wrapper .popup-title",
    ),
    fakeSubjectPlaceholder: document.querySelector(
      ".add-time-table-popup-wrapper .subject-placeholder",
    ),
    fakeTypePlaceholder: document.querySelector(
      ".add-time-table-popup-wrapper .type-placeholder",
    ),
    fakeToTimePlaceholder: document.querySelector(
      ".add-time-table-popup-wrapper .to-time-placeholder",
    ),
    fakeFromTimePlaceholder: document.querySelector(
      ".add-time-table-popup-wrapper .from-time-placeholder",
    ),
    inputs: {
      subject: document.querySelector("#timetable-subject-selection-drop-down"),
      type: document.querySelector("#timetable-type-selection-drop-down"),
      fromTime: document.querySelector("#timetable-from-time-input"),
      toTime: document.querySelector("#timetable-to-time-input"),
      date: document.querySelector("#timetable-date-input"),
    },
    errors: {
      subject: document.querySelector(
        ".add-time-table-popup-wrapper .subject-error",
      ),
      type: document.querySelector(".add-time-table-popup-wrapper .type-error"),
      fromTime: document.querySelector(
        ".add-time-table-popup-wrapper .from-time-error",
      ),
      toTime: document.querySelector(
        ".add-time-table-popup-wrapper .to-time-error",
      ),
      date: document.querySelector(".add-time-table-popup-wrapper .date-error"),
    },
  },
  noticeSwiper: {
    swiper: new Swiper("#dashboard-notice-swiper", {
      direction: "horizontal",
      slidesPerView: "auto",
      spaceBetween: 30,
      loop: false,
      centeredSlides: true,
      watchOverflow: true,
      breakpoints: {
        768: {
          centeredSlides: false,
        },
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      observer: true,
      observeParents: true,
    }),
    wrapper: document.querySelector("#subject-page-swiper .swiper-wrapper"),
    pagination: document.querySelector(".swiper-pagination"),
    prevBtn: document.querySelector(".swiper-button-prev"),
    nextBtn: document.querySelector(".swiper-button-next"),
  },
  noticePopup: {
    popup: document.querySelector(
      ".dashboard-section .add-notice-popup-wrapper",
    ),
    popupTitle: document.querySelector(
      ".dashboard-section .add-notice-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".dashboard-section .add-notice-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".dashboard-section .add-notice-popup-wrapper .success-btn",
    ),
    fakeScopePlaceholder: document.querySelector(
      ".dashboard-section .add-notice-popup-wrapper .scope-placeholder",
    ),
    inputs: {
      title: document.querySelector("#dashboard-section-notice-title"),
      description: document.querySelector(
        "#dashboard-section-notice-description",
      ),
      link: document.querySelector("#dashboard-section-notice-link"),
      file: document.querySelector("#dashboard-section-notice-file-input"),
      scope: document.querySelector("#dashboard-section-notice-scope-input"),
    },
    errors: {
      title: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .title-error",
      ),
      description: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .description-error",
      ),
      link: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .link-error",
      ),
      file: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .file-error",
      ),
      scope: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .scope-error",
      ),
    },
    fileAttachment: {
      icon: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .upload-icon",
      ),
      text: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .upload-text",
      ),
      inputWrapper: document.querySelector(
        ".dashboard-section .add-notice-popup-wrapper .file-input-wrapper",
      ),
    },
  },
  menuPopup: {
    popup: document.querySelector(".menu-popup-wrapper"),
    points: document.querySelector(".menu-popup-wrapper .points"),
    medals: {
      gold: document.querySelector(".menu-popup-wrapper .gold-medal .qty"),
      silver: document.querySelector(".menu-popup-wrapper .silver-medal .qty"),
      bronze: document.querySelector(".menu-popup-wrapper .bronze-medal .qty"),
    },
    userName: document.querySelector(".menu-popup-wrapper .user-name"),
    userPfp: document.querySelector(".menu-popup-wrapper .user-pfp"),
    changeThemeBtn: document.querySelector(
      ".menu-popup-wrapper .change-theme-btn",
    ),
    accountDetailsBtn: document.querySelector(
      ".menu-popup-wrapper .account-details-btn",
    ),
    personalFolderBtn: document.querySelector(
      ".menu-popup-wrapper .personal-folder-btn",
    ),
    switchClassBtn: document.querySelector(
      ".menu-popup-wrapper .switch-class-btn-wrapper",
    ),
    adminPanelBtn: document.querySelector(
      ".menu-popup-wrapper .admin-panel-btn-wrapper",
    ),
    logoutBtn: document.querySelector(".menu-popup-wrapper .logout-btn"),
    closePopupBtn: document.querySelector(
      ".menu-popup-wrapper .close-popup-btn",
    ),
    pfpOverlay: document.querySelector(".menu-popup-wrapper .pfp-overlay"),
    editPfpBtn: document.querySelector(".menu-popup-wrapper .edit-pfp-btn"),
  },
  accountDetailsPopup: {
    popup: document.querySelector(".account-details-popup-wrapper"),
    closePopupBtn: document.querySelector(
      ".account-details-popup-wrapper .close-popup-btn",
    ),
    userPfp: document.querySelector(".account-details-popup-wrapper .user-pfp"),
    userName: document.querySelector(
      ".account-details-popup-wrapper .user-name",
    ),
    editPfpBtn: document.querySelector(
      ".account-details-popup-wrapper .edit-pfp-btn",
    ),
    points: document.querySelector(".account-details-popup-wrapper .points"),
    medals: {
      gold: document.querySelector(
        ".account-details-popup-wrapper .gold-medal .qty",
      ),
      silver: document.querySelector(
        ".account-details-popup-wrapper .silver-medal .qty",
      ),
      bronze: document.querySelector(
        ".account-details-popup-wrapper .bronze-medal .qty",
      ),
    },
    details: {
      firstName: document.querySelector(
        ".account-details-popup-wrapper .first-name",
      ),
      lastName: document.querySelector(
        ".account-details-popup-wrapper .last-name",
      ),
      email: document.querySelector(".account-details-popup-wrapper .email"),
      rollNo: document.querySelector(".account-details-popup-wrapper .roll-no"),
      division: document.querySelector(
        ".account-details-popup-wrapper .division",
      ),
      semester: document.querySelector(
        ".account-details-popup-wrapper .semester",
      ),
    },
    pfpOverlay: document.querySelector(
      ".account-details-popup-wrapper .pfp-overlay",
    ),
  },
};
let batchList;
export async function loadDashboard() {
  try {
    loadTypeSelectorTimetablePopup();
    await unloadDashboard();
    renderNoticeSlider();
    renderUpcomingSubmissions();
    renderTimeTableSlides(DOM.timeTableSwiper.swiper);
    renderTimeTableSlides(timeTablePopupSwiper);
    batchList =
      appState.divisionData?.batchList &&
      Object.values(appState.divisionData.batchList).filter(Boolean).length > 0
        ? Object.values(appState.divisionData.batchList).filter(Boolean)
        : ["1"];
    const curBatch = batchList[currentBatchIndex] || batchList[0] || "1";
    DOM.timeTableSwiper.batchToggleBtn.textContent =
      curBatch.charAt(0).toUpperCase() + curBatch.slice(1);
    DOM.timeTablePopupSwiper.batchToggleBtn.textContent =
      curBatch.charAt(0).toUpperCase() + curBatch.slice(1);
    initUserInfo();
    if (appState.userData.role === "teacher")
      showElement(DOM.menuPopup.switchClassBtn);
    else if (appState.userData.role === "admin")
      showElement(DOM.menuPopup.adminPanelBtn);
    else {
      hideElement(DOM.menuPopup.adminPanelBtn);
      hideElement(DOM.menuPopup.switchClassBtn);
    }
    currentBatchIndex = -1;
    switchBatch();
    currentBatchIndex = 0;
    loadTypeSelectorSubjects();
    renderTimeTablePopupSubjects();
  } catch (error) {
    showErrorSection("Error loading dashboard:", error);
  }
}
export async function showDashboard() {
  history.pushState({}, "", "/?dashboard=''");
  if (window.innerWidth > 500)
    headerTitle.textContent = `Hello ${appState.userData.firstName}`;
  else headerTitle.textContent = `Hi ${appState.userData.firstName}`;
  await hideSections();
  await applyEditModeUI();
  pfpElement.src = appState.userData.pfpLink;
  headerIcon.innerHTML = "";
  headerIcon.classList.remove("bg-primary");
  headerIcon.appendChild(pfpElement);
  if (window.innerWidth > 1024) hideElement(headerIcon);
  else showElement(headerIcon);
  await fadeInEffect(DOM.dashboardSection);
  timeTablePopupSwiper.update();
  DOM.timeTableSwiper.swiper.update();
}
export async function unloadDashboard() {
  const subjectSelectionDropDown = document.querySelector(
    "#timetable-subject-selection-drop-down",
  );
  DOM.noticeSwiper.swiper.removeAllSlides();
  await fadeOutEffect(DOM.dashboardSection);
  subjectSelectionDropDown.innerHTML = "";
  DOM.upcomingSubmissions.cardContainer.innerHTML = "";
  DOM.timeTableSwiper.swiper.removeAllSlides();
  timeTablePopupSwiper.removeAllSlides();
  DOM.noticeSwiper.swiper.removeAllSlides();
}
export function renderUpcomingSubmissions() {
  DOM.upcomingSubmissions.cardContainer.innerHTML = "";
  const upcomingSubmissions = appState?.divisionData?.upcomingSubmissionData;
  if (!upcomingSubmissions || Object.keys(upcomingSubmissions).length === 0) {
    hideElement(DOM.upcomingSubmissions.container);
    return;
  }
  const subjectMetaData = appState.subjectMetaData;
  const allSubmissions = [];
  for (const subjectKey in upcomingSubmissions) {
    const subject = upcomingSubmissions[subjectKey];
    for (const submissionKey in subject) {
      allSubmissions.push({
        ...subject[submissionKey],
        subjectName: subjectMetaData?.[subjectKey]?.name || subjectKey,
        subjectIcon: subjectMetaData?.[subjectKey]?.iconLink || "",
        dueDate: subject[submissionKey].dueDate,
      });
    }
  }

  allSubmissions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  allSubmissions.forEach((submission) => {
    const card = document.createElement("div");
    card.classList.add(
      "card",
      "p-4",
      "bg-surface-2",
      "rounded-[1.125rem]",
      "flex",
      "flex-col",
      "lg:gap-3",
      "py-5",
      "cursor-pointer",
      "custom-hover",
    );

    const date = formatDateBasedOnProximity(submission.dueDate);

    card.innerHTML = `
      <div class="wrapper flex items-center gap-1 lg:gap-3 pt-1 ">
        <img
          src="${submission.subjectIcon}"
          alt=""
          class="w-[1.5rem] h-[1.5rem] lg:w-[2.5rem] lg:h-[2.5rem] mb-1 lg:mb-0"
        />
        <p class="subject-name font-semibold text-text-primary">
          ${submission.subjectName.charAt(0).toUpperCase() + submission.subjectName.slice(1)}
        </p>
      </div>
      <div class="wrapper flex flex-col lg:gap-1 text-text-secondary">
        <p class="description">
          ${submission.name.charAt(0).toUpperCase() + submission.name.slice(1)}
        </p>
        <p class="submission-date">
          ${date.charAt(0).toUpperCase() + date.slice(1)}
        </p>
      </div>
    `;
    card.addEventListener("click", () => {
      history.pushState({}, "", `?subject=${submission.subjectName}`);
      initRouting();
    });
    DOM.upcomingSubmissions.cardContainer.appendChild(card);
  });
}
function showWarningPopup(message) {
  return new Promise((resolve) => {
    DOM.warningPopup.message.textContent = message;
    fadeInEffect(DOM.warningPopup.popup);
    DOM.warningPopup.successBtn.addEventListener("click", async () => {
      await fadeOutEffect(DOM.warningPopup.popup);
      resolve(true);
    });
  });
}
function formatDateBasedOnProximity(rawDate) {
  const dateObj = new Date(rawDate);
  if (isNaN(dateObj)) return rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const now = new Date();

  // Normalize both to YYYY-MM-DD (removing time portion)
  const todayStr = now.toISOString().split("T")[0];
  const dateStr = dateObj.toISOString().split("T")[0];

  if (dateStr === todayStr) {
    return "Today";
  }

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  const day = dateObj.getDate().toString().padStart(2, "0");

  if (dateObj <= sevenDaysLater) {
    // Format: DD-Wed (within next 7 days)
    const weekday = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
    });
    return `${day}-${weekday}`;
  } else {
    // Format: DD-Aug (more than 7 days away)
    const month = dateObj.toLocaleDateString("en-US", {
      month: "short",
    });
    return `${day}-${month}`;
  }
}
DOM.menuPopup.switchClassBtn.addEventListener("click", () => {
  showSelectClassPopup(appState.userData);
});
DOM.menuPopup.adminPanelBtn.addEventListener("click", () => {
  initAdminRouting(appState.userData);
});

// notice section function and listener
DOM.addNoticeBtn.addEventListener("click", () => {
  fadeInEffect(DOM.noticePopup.popup);
});
DOM.noticePopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.noticePopup.popup);
  resetNoticePopup();
});
DOM.noticePopup.inputs.scope.addEventListener("change", () => {
  hideElement(DOM.noticePopup.fakeScopePlaceholder);
});
DOM.noticePopup.inputs.file.addEventListener("change", () => {
  const file = DOM.noticePopup.inputs.file.files[0];
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      DOM.noticePopup.inputs.file.value = "";
      DOM.noticePopup.errors.file.textContent = "File too large (max 20MB)";
      fadeInEffect(DOM.noticePopup.errors.file);
      fadeInEffect(DOM.noticePopup.fileAttachment.icon);
      return;
    }
    hideElement(DOM.noticePopup.fileAttachment.icon);
    DOM.noticePopup.fileAttachment.text.textContent = "1 file attached";
  } else {
    showElement(DOM.noticePopup.fileAttachment.icon);
    DOM.noticePopup.fileAttachment.text.textContent = "Upload";
  }
});
DOM.noticePopup.inputs.title.addEventListener("input", () => {
  if (DOM.noticePopup.inputs.title.value.length == 21) {
    DOM.noticePopup.errors.title.textContent = "Max 20 characters reached";

    DOM.noticePopup.inputs.title.value =
      DOM.noticePopup.inputs.title.value.slice(0, 20);
    showElement(DOM.noticePopup.errors.title);
  } else {
    hideElement(DOM.noticePopup.errors.title);
  }
});
DOM.noticePopup.fileAttachment.inputWrapper.addEventListener("click", () => {
  DOM.noticePopup.inputs.file.click();
});
DOM.noticePopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.noticePopup.errors.title);
  hideElement(DOM.noticePopup.errors.description);
  hideElement(DOM.noticePopup.errors.link);
  hideElement(DOM.noticePopup.errors.scope);
  hideElement(DOM.noticePopup.errors.link);
  const title = DOM.noticePopup.inputs.title.value.trim();
  const description = DOM.noticePopup.inputs.description.value.trim();
  const file = DOM.noticePopup.inputs.file.files[0];
  const type = DOM.noticePopup.inputs.scope.value;
  const link = DOM.noticePopup.inputs.link.value.trim();
  let hasError = false;
  let topic;
  if (!title) {
    DOM.noticePopup.errors.title.textContent = "Title is required";
    showElement(DOM.noticePopup.errors.title);
    hasError = true;
  }
  if (!type) {
    DOM.noticePopup.errors.scope.textContent = "Scope is required";
    showElement(DOM.noticePopup.errors.scope);
    hasError = true;
  }
  if (!description) {
    DOM.noticePopup.errors.description.textContent = "Description is required";
    showElement(DOM.noticePopup.errors.description);
    hasError = true;
  }
  if (!file && link && !/^https?:\/\//.test(link)) {
    DOM.noticePopup.errors.link.textContent = "Enter a valid link";
    showElement(DOM.noticePopup.errors.link);
    hasError = true;
  }
  if (file && link) {
    await showWarningPopup("Only 1 can be uploaded: link or attachment");
    await fadeOutEffect(DOM.noticePopup.popup);
    resetNoticePopup();
    return;
  }
  if (hasError) return;
  let attachmentURL = "";
  let attachmentId = "";
  showSectionLoader("Uploading attachment...");
  if (file) {
    let uploaded;
    if (type === "department") {
      uploaded = await uploadDriveFile(file, `resources/globalData/notices`);
    } else if (type === "division") {
      uploaded = await uploadDriveFile(
        file,
        `resources/${appState.activeSem}/${appState.activeDiv}/divisionData/notices`,
      );
    } else if (type === "semester") {
      uploaded = await uploadDriveFile(
        file,
        `resources/${appState.activeSem}/semesterData/notices`,
      );
    } else {
      uploaded = await uploadDriveFile(
        file,
        `resources/${appState.activeSem}/${appState.activeDiv}/${appState.activeSubject}/notices`,
      );
    }
    if (!uploaded) {
      hideSectionLoader();
      return;
    }
    attachmentURL = uploaded.webViewLink;
    attachmentId = uploaded.fileId;
  } else if (link) {
    attachmentURL = link;
    attachmentId = "custom-link";
  }
  showSectionLoader("Adding notice...");
  const obj = {
    attachmentURL,
    attachmentId,
    title,
    description,
    createdAt: Date.now(),
    scope: type,
  };
  let isSubNotice = false;
  if (type === "department") {
    await pushData(`globalData/noticeList`, obj);
    topic = "global";
  } else if (type === "division") {
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/divisionNoticeList`,
      obj,
    );
    topic = "division";
  } else if (type === "semester") {
    await pushData(
      `semesterList/${appState.activeSem}/semesterGlobalData/noticeList`,
      obj,
    );
    topic = "semester";
  } else {
    obj.scope = type;
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${type}`,
      obj,
    );
    topic = "division";
    isSubNotice = true;
  }
  await fadeOutEffect(DOM.noticePopup.popup);
  resetNoticePopup();
  await showSectionLoader("Syncing data...");
  await syncDbData();
  if (isSubNotice) await subjectRenderNoticeSlider();
  await hideSectionLoader();
  await loadDashboard();
  sendNotification(title, description, topic);
  showDashboard();
});
function loadTypeSelectorSubjects() {
  DOM.noticePopup.inputs.scope.innerHTML = "";
  const option = document.createElement("option");
  option.value = "semester";
  option.textContent = "For Semester";
  const option2 = document.createElement("option");
  option2.value = "department";
  option2.textContent = "For Department";
  const option3 = document.createElement("option");
  option3.value = "division";
  option3.textContent = "For Division";
  DOM.noticePopup.inputs.scope.appendChild(option3);
  DOM.noticePopup.inputs.scope.appendChild(option2);
  DOM.noticePopup.inputs.scope.appendChild(option);
  for (const key in appState.subjectMetaData) {
    const element = appState.subjectMetaData[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${element.name} notice`;
    DOM.noticePopup.inputs.scope.appendChild(option);
  }
  DOM.noticePopup.inputs.scope.value = "";
}
function loadTypeSelectorTimetablePopup() {
  DOM.timeTablePopup.inputs.type.innerHTML = "";
  const option = document.createElement("option");
  option.value = "lecture";
  option.textContent = "Lecture";

  DOM.timeTablePopup.inputs.type.appendChild(option);
  const batches = appState.divisionData?.batchList || {};
  for (const key in batches) {
    const element = batches[key];
    if (!element) continue;
    const option = document.createElement("option");
    option.value = `${element}Practical`;
    option.textContent = `${element.charAt(0).toUpperCase() + element.slice(1)} Practical`;
    const option2 = document.createElement("option");
    option2.value = `${element}Tutorial`;
    option2.textContent = `${element.charAt(0).toUpperCase() + element.slice(1)} Tutorial`;
    DOM.timeTablePopup.inputs.type.appendChild(option);
    DOM.timeTablePopup.inputs.type.appendChild(option2);
  }
}
export function renderNoticeSlider() {
  DOM.noticeSwiper.swiper.removeAllSlides();
  const noticeEntries = getFlatNoticeOrdered();
  if (!noticeEntries || Object.keys(noticeEntries).length === 0) {
    DOM.noticeSwiper.swiper.el.classList.add("!hidden");
    return;
  }
  DOM.noticeSwiper.swiper.el.classList.remove("!hidden");
  for (const key in noticeEntries) {
    const noticeData = noticeEntries[key];
    const swiperSlide = document.createElement("div");
    swiperSlide.className =
      "swiper-slide w-full max-w-[37.5rem] bg-surface-2 !flex !flex-col gap-3 rounded-2xl p-4 lg:p-5";
    const topWrapper = document.createElement("div");
    topWrapper.className = "wrapper flex items-center gap-4  justify-between";

    const iconTitleWrapper = document.createElement("div");
    iconTitleWrapper.className =
      "slide-icon-title-wrapper w-full flex items-center gap-2 lg:gap-3";

    const icon = document.createElement("div");
    icon.className =
      "icon bg-surface-1 flex h-[3rem] w-[3rem] items-center justify-center rounded-full shrink-0";

    const iconInner = document.createElement("i");
    iconInner.className = "ri-file-text-line text-2xl";
    icon.appendChild(iconInner);

    const title = document.createElement("p");
    title.className = "slider-title text-xl font-semibold leading-tight";
    title.textContent =
      noticeData.title.charAt(0).toUpperCase() + noticeData.title.slice(1);

    iconTitleWrapper.appendChild(icon);
    iconTitleWrapper.appendChild(title);

    topWrapper.appendChild(iconTitleWrapper);

    const createdAt = noticeData.createdAt;
    const now = Date.now();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    if (diffInMinutes <= 1440) {
      const tag = document.createElement("p");
      tag.className =
        "bg-primary text-on-primary px-2 py-1 w-fit rounded-xl text-xs";
      tag.textContent = "New";
      topWrapper.appendChild(tag);
    }
    const deleteIcon = document.createElement("div");
    deleteIcon.className =
      "delete-icon hidden editor-tool ml-auto flex items-center";
    const deleteIconInner = document.createElement("i");
    deleteIconInner.className =
      "fa-solid fa-trash text-xl cursor-pointer text-text-error";
    deleteIcon.appendChild(deleteIconInner);
    topWrapper.appendChild(deleteIcon);
    const wrapper2 = document.createElement("div");
    wrapper2.className = "wrapper";

    const description = document.createElement("div");
    description.className = "description text-text-secondary line-clamp-5";
    description.innerHTML =
      noticeData.description.charAt(0).toUpperCase() +
      noticeData.description.slice(1).replace(/\n/g, "<br>");

    const linkWrapper = document.createElement("div");
    linkWrapper.className =
      "wrapper text-text-link underline text-sm flex gap-4 pb-4 md:pb-0";

    const readmore = document.createElement("p");
    readmore.className = "cursor-pointer";
    readmore.textContent = "Readmore";
    readmore.style.display = "none";

    const attachment = document.createElement("a");
    attachment.textContent = "See attachment";
    attachment.className = "cursor-pointer hidden";
    attachment.target = "_blank";
    deleteIcon.addEventListener("click", async () => {
      deleteNotice(key, noticeData.attachmentId, noticeData.scope);
    });

    if (noticeData.attachmentURL) {
      let rawURL = noticeData.attachmentURL;
      if (!rawURL.startsWith("http")) {
        rawURL = "https://" + rawURL;
      }
      attachment.href = rawURL;
      attachment.classList.remove("hidden");
    }
    linkWrapper.appendChild(readmore);
    linkWrapper.appendChild(attachment);
    wrapper2.appendChild(description);
    wrapper2.appendChild(linkWrapper);
    swiperSlide.appendChild(topWrapper);
    swiperSlide.appendChild(wrapper2);
    DOM.noticeSwiper.swiper.appendSlide(swiperSlide);
    setupReadmoreObserver(description, readmore);
    readmore.addEventListener("click", () => {
      const popup = document.getElementById("readmore-popup");
      const popupTitle = document.getElementById("readmore-popup-title");
      const popupContent = document.getElementById("readmore-popup-content");
      const popupAttachment = document.getElementById("popup-attachment-link");
      popupAttachment;
      popupTitle.textContent = noticeData.title;
      popupContent.textContent = noticeData.description;
      if (noticeData.attachmentURL) {
        popupAttachment.href = noticeData.attachmentURL;
        popupAttachment.target = "_blank";
        popupAttachment.classList.remove("hidden");
      } else {
        popupAttachment.classList.add("hidden");
      }
      fadeInEffect(popup);
    });
  }
}
document
  .getElementById("close-readmore-popup")
  ?.addEventListener("click", () => {
    const element = document.getElementById("readmore-popup");
    fadeOutEffect(element);
  });
function setupReadmoreObserver(description, readmore) {
  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const target = entry.target;
      if (target.scrollHeight > target.clientHeight) {
        readmore.style.display = "inline";
      }
    }
  });
  observer.observe(description);
}
function getFlatNoticeOrdered() {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const merged = {};

  // Helper: split into recent and old, and reverse each for latest-first
  const splitAndReverse = (data) => {
    const recent = [];
    const older = [];

    for (const [key, val] of Object.entries(data || {})) {
      if (val.createdAt && now - val.createdAt < oneDayMs) {
        recent.push([key, val]);
      } else {
        older.push([key, val]);
      }
    }

    return {
      recent: recent.reverse(), // latest first
      older: older.reverse(), // latest old first
    };
  };
  // Collect all major groups
  const global = splitAndReverse(appState.globalData?.noticeList);
  const semester = splitAndReverse(appState.semesterGlobalData?.noticeList);
  const division = splitAndReverse(
    appState.divisionData?.noticeData?.divisionNoticeList,
  );
  // Flatten and split subject notices
  const subjectRaw = appState.divisionData?.noticeData?.subjectNoticeData || {};
  const subjectFlat = {};
  for (const subjectGroup of Object.values(subjectRaw)) {
    if (!subjectGroup) continue;
    for (const [key, val] of Object.entries(subjectGroup)) {
      subjectFlat[key] = val;
    }
  }
  const subject = splitAndReverse(subjectFlat);
  // Merge all in priority + recency order
  const addToMerged = (pairs) => {
    for (const [key, val] of pairs) {
      merged[key] = val;
    }
  };
  // Final merging: recent → old, global → semester → division → subject
  addToMerged(global.recent);
  addToMerged(semester.recent);
  addToMerged(division.recent);
  addToMerged(subject.recent);
  addToMerged(global.older);
  addToMerged(semester.older);
  addToMerged(division.older);
  addToMerged(subject.older);
  return merged;
}
async function deleteNotice(key, attachmentId, scope) {
  const confirmed = await showConfirmationPopup(
    "The notice will be deleted permenantly",
  );
  if (!confirmed) return;
  showSectionLoader("Deleting notice...");
  if (attachmentId && attachmentId !== "custom-link") {
    showSectionLoader("Deleting attachment...");
    const deleted = await deleteDriveFile(attachmentId);
    if (!deleted) {
      showErrorSection();
      return;
    }
    showSectionLoader("Deleting notice...");
  }
  let isSubNotice = false;
  if (scope === "department") {
    await deleteData(`globalData/noticeList/${key}`);
  } else if (scope === "semester") {
    await deleteData(
      `semesterList/${appState.activeSem}/semesterGlobalData/noticeList/${key}`,
    );
  } else if (scope === "division") {
    await deleteData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/divisionNoticeList/${key}`,
    );
  } else {
    await deleteData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${scope}/${key}`,
    );
    isSubNotice = true;
  }
  await deleteData(
    `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/subjects/notice/${appState.activeSubject}/${key}`,
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  if (isSubNotice) await subjectRenderNoticeSlider();

  await hideSectionLoader();
  await loadDashboard();
  showDashboard();
}
function resetNoticePopup() {
  DOM.noticePopup.inputs.title.value = "";
  DOM.noticePopup.inputs.link.value = "";
  DOM.noticePopup.inputs.description.value = "";
  DOM.noticePopup.inputs.scope.value = "";
  DOM.noticePopup.inputs.file.value = "";
  DOM.noticePopup.fileAttachment.text.textContent = "Upload File";
  showElement(DOM.noticePopup.fileAttachment.icon);
  showElement(DOM.noticePopup.fakeScopePlaceholder);
  hideElement(DOM.noticePopup.errors.title);
  hideElement(DOM.noticePopup.errors.description);
  hideElement(DOM.noticePopup.errors.link);
  hideElement(DOM.noticePopup.errors.scope);
  hideElement(DOM.noticePopup.errors.file);
}

// time table popup function and listener
let selectedDay = null;
let selectedEntry = null;
let isTimeTableEditing = false;
DOM.timeTablePopupSwiper.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.timeTablePopupSwiper.popup);
  timeTablePopupSwiper.slideTo(0, 0);
});
DOM.timeTablePopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.timeTablePopup.popup);
  resetTimeTablePopup();
});
DOM.timeTablePopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.timeTablePopup.errors.subject);
  hideElement(DOM.timeTablePopup.errors.type);
  hideElement(DOM.timeTablePopup.errors.fromTime);
  hideElement(DOM.timeTablePopup.errors.toTime);
  const subject = DOM.timeTablePopup.inputs.subject.value;
  const type = DOM.timeTablePopup.inputs.type.value;
  const timeFrom = DOM.timeTablePopup.inputs.fromTime.value;
  const timeTo = DOM.timeTablePopup.inputs.toTime.value;
  let isError = false;
  if (!subject) {
    DOM.timeTablePopup.errors.subject.textContent = "Required";
    showElement(DOM.timeTablePopup.errors.subject);
    isError = true;
  }
  if (!type) {
    DOM.timeTablePopup.errors.type.textContent = "Required";
    showElement(DOM.timeTablePopup.errors.type);
    isError = true;
  }
  if (!timeFrom) {
    DOM.timeTablePopup.errors.fromTime.textContent = "Required";
    showElement(DOM.timeTablePopup.errors.fromTime);
    isError = true;
  }
  if (!timeTo) {
    DOM.timeTablePopup.errors.toTime.textContent = "Required";
    showElement(DOM.timeTablePopup.errors.toTime);
    isError = true;
  }
  if (isError) return;
  const newSlot = {
    subject: subject,
    type: type,
    fromTime: timeFrom,
    toTime: timeTo,
  };
  if (isTimeTableEditing) {
    showSectionLoader("Updating slot...");
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/timetableDayList/${selectedDay}/slotList/${selectedEntry}`,
      newSlot,
    );
  } else {
    showSectionLoader("Adding slot...");

    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/timetableDayList/${selectedDay}/slotList`,
      newSlot,
    );
  }
  showSectionLoader("syncing data...");
  await fadeOutEffect(DOM.timeTablePopup.popup);
  await fadeOutEffect(DOM.timeTablePopupSwiper.popup);
  await syncDbData();
  resetTimeTablePopup();
  hideSectionLoader();
  await loadDashboard();
  showDashboard();
});
DOM.timeTablePopup.inputs.fromTime.addEventListener("click", () => {
  DOM.timeTablePopup.inputs.fromTime.showPicker();
});
DOM.timeTablePopup.inputs.toTime.addEventListener("click", () => {
  DOM.timeTablePopup.inputs.toTime.showPicker();
});
DOM.timeTablePopup.inputs.subject.addEventListener("change", () => {
  hideElement(DOM.timeTablePopup.fakeSubjectPlaceholder);
});
DOM.timeTablePopup.inputs.type.addEventListener("change", () => {
  hideElement(DOM.timeTablePopup.fakeTypePlaceholder);
});
DOM.timeTablePopup.inputs.fromTime.addEventListener("change", () => {
  hideElement(DOM.timeTablePopup.fakeFromTimePlaceholder);
});
DOM.timeTablePopup.inputs.toTime.addEventListener("change", () => {
  hideElement(DOM.timeTablePopup.fakeToTimePlaceholder);
});
DOM.timeTablePopup.inputs.subject.addEventListener("click", () => {
  hideElement(DOM.timeTablePopup.fakeSubjectPlaceholder);
});
DOM.timeTablePopup.inputs.type.addEventListener("click", () => {
  hideElement(DOM.timeTablePopup.fakeTypePlaceholder);
});
DOM.timeTablePopupSwiper.popup.addEventListener("click", (e) => {
  const target = e.target.closest(".popup");
  const popup = DOM.timeTablePopupSwiper.popup.querySelector(".popup");
  if (target === popup) return;
  else fadeOutEffect(DOM.timeTablePopupSwiper.popup);
});
async function resetTimeTablePopup() {
  DOM.timeTablePopup.popupTitle.textContent = "Add Slot";
  DOM.timeTablePopup.inputs.subject.value = "";
  DOM.timeTablePopup.inputs.type.value = "";
  DOM.timeTablePopup.inputs.toTime.value = "";
  DOM.timeTablePopup.inputs.fromTime.value = "";
  DOM.timeTablePopup.successBtn.textContent = "Add Slot";
  isTimeTableEditing = false;
  showElement(DOM.timeTablePopup.fakeSubjectPlaceholder);
  showElement(DOM.timeTablePopup.fakeTypePlaceholder);
  showElement(DOM.timeTablePopup.fakeFromTimePlaceholder);
  showElement(DOM.timeTablePopup.fakeToTimePlaceholder);
  hideElement(DOM.timeTablePopup.deleteBtn);
  hideElement(DOM.timeTablePopup.errors.type);
  hideElement(DOM.timeTablePopup.errors.subject);
  hideElement(DOM.timeTablePopup.errors.fromTime);
  hideElement(DOM.timeTablePopup.errors.toTime);
}
function renderTimeTablePopupSubjects() {
  const subjectData = appState.subjectMetaData;
  for (const key in subjectData) {
    const subject = subjectData[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = subject.name;
    option.className = "text-text-primary";
    DOM.timeTablePopup.inputs.subject.appendChild(option);
  }
  DOM.timeTablePopup.inputs.subject.value = "";
}
async function editSlot(subjectName, type, timeFrom, timeTo, key) {
  showElement(DOM.timeTablePopup.deleteBtn);
  isTimeTableEditing = true;
  selectedEntry = key;
  DOM.timeTablePopup.popupTitle.textContent = "Edit Slot";
  DOM.timeTablePopup.inputs.subject.value = subjectName;
  DOM.timeTablePopup.inputs.type.value = type;
  DOM.timeTablePopup.inputs.fromTime.value = timeFrom;
  DOM.timeTablePopup.inputs.toTime.value = timeTo;
  DOM.timeTablePopup.successBtn.textContent = "Update Slot";
  hideElement(DOM.timeTablePopup.fakeSubjectPlaceholder);
  hideElement(DOM.timeTablePopup.fakeTypePlaceholder);
  hideElement(DOM.timeTablePopup.fakeFromTimePlaceholder);

  hideElement(DOM.timeTablePopup.fakeToTimePlaceholder);
  fadeInEffect(DOM.timeTablePopup.popup);
}
DOM.timeTablePopup.deleteBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this slot?",
  );
  if (!isConfirmed) return;
  showSectionLoader("Deleting slot...");
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/timetableDayList/${selectedDay}/slotList/${selectedEntry}`,
  );
  await fadeOutEffect(DOM.timeTablePopup.popup);
  showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.timeTablePopupSwiper.popup);
  resetTimeTablePopup();
  await syncDbData();
  hideSectionLoader();
  await loadDashboard();
  await showDashboard();
});
function renderTimeTableSlides(swiperInstance) {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const todayIndex = today.getDay();
  const dayOrder = Array.from({ length: 7 }, (_, i) => {
    return daysOfWeek[(todayIndex + i) % 7];
  });
  const timetableData = appState.divisionData?.timetableDayList || {};
  const sortedTimetable = {};
  dayOrder.forEach((day) => {
    sortedTimetable[day] =
      timetableData[day.toLowerCase()] ||
      timetableData[day.charAt(0).toUpperCase() + day.slice(1)] ||
      timetableData[day] ||
      {};
  });
  for (const key in sortedTimetable) {
    const day = sortedTimetable[key] || {};
    const daySlide = document.createElement("div");
    daySlide.className = "swiper-slide !flex !flex-col gap-3 ";
    const dayDiv = document.createElement("div");
    dayDiv.className =
      "day font-semibold text-center text-xl w-full translate flex gap-2 justify-center items-center leading-tight -translatey-1";
    dayDiv.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    const plusIcon = document.createElement("div");
    plusIcon.className = "plus-icon hidden editor-tool";
    const plusIconInner = document.createElement("i");
    plusIconInner.className = "fa-solid fa-plus text-xl cursor-pointer";
    plusIcon.appendChild(plusIconInner);
    dayDiv.appendChild(plusIcon);
    daySlide.appendChild(dayDiv);
    plusIcon.addEventListener("click", () => {
      selectedDay = key;
      selectedEntry = null;
      fadeInEffect(DOM.timeTablePopup.popup);
    });
    if (!day.slotList || Object.keys(day.slotList).length === 0) {
      const wrapper = document.createElement("div");
      wrapper.className =
        "wrapper w-fit h-fit flex flex-col gap-2 mx-auto my-auto items-center";
      const img = document.createElement("img");
      img.src =
        "https://ik.imagekit.io/yn9gz2n2g/others/holiday.png?updatedAt=1753439319775";
      img.alt = "";
      img.className = "h-20 w-20";
      const p = document.createElement("p");
      p.className = "font-semibold text-center";
      p.textContent = "Holiday";
      wrapper.appendChild(img);
      wrapper.appendChild(p);
      daySlide.appendChild(wrapper);
      swiperInstance.appendSlide(daySlide);

      continue;
    }
    const cardDiv = document.createElement("div");
    cardDiv.className =
      "card flex flex-col gap-4 border-2 border-surface-3 rounded-xl p-4 overflow-y-auto scrollbar-hide h-full";
    for (const key2 in day.slotList) {
      const singleEntry = day.slotList[key2];
      const subjectName = singleEntry.subject;
      const icon = appState.subjectMetaData?.[subjectName]?.iconLink || "";
      const type = singleEntry.type;
      const timeFrom = new Date(`1970-01-01T${singleEntry.fromTime}:00`)
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\s?[AP]M/i, "");

      const timeTo = new Date(`1970-01-01T${singleEntry.toTime}:00`)
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\s?[AP]M/i, "");

      const time = `${timeFrom}-${timeTo}`;
      const wrapper = document.createElement("div");
      wrapper.className = "wrapper flex items-center justify-between w-full ";
      const nameIconWrapper = document.createElement("div");
      nameIconWrapper.className =
        "name-icon-wrapper flex items-center gap-2 w-20";
      const img = document.createElement("img");
      img.src = icon;
      img.alt = "";
      img.className = "h-[2.0rem] w-[2.0rem]";
      const subjectNameP = document.createElement("p");
      subjectNameP.className = "subject-name";
      subjectNameP.textContent = subjectName;
      nameIconWrapper.appendChild(img);
      nameIconWrapper.appendChild(subjectNameP);
      const typeP = document.createElement("p");
      typeP.className = "type w-10";
      const timeP = document.createElement("p");
      timeP.className = "time text-text-tertiary w-25";
      timeP.textContent = time;
      const typeLower = type.toLowerCase();

      let batchName = "all"; // default for lectures
      if (typeLower.includes("tutorial") || typeLower.includes("practical")) {
        const batchMatch = typeLower.match(/^(.*?)\s*(tutorial|practical)/i);
        batchName = batchMatch ? batchMatch[1] : "all";
      }
      wrapper.setAttribute("data-batch", batchName);

      // Type text display
      if (typeLower.includes("tutorial")) {
        typeP.textContent = "Tut";
      } else if (typeLower.includes("practical")) {
        typeP.textContent = "Prac";
      } else if (typeLower.includes("lecture")) {
        typeP.textContent = "Lec";
      } else {
        typeP.textContent = type;
      }

      wrapper.appendChild(nameIconWrapper);
      wrapper.appendChild(typeP);
      wrapper.appendChild(timeP);
      cardDiv.appendChild(wrapper);
      daySlide.appendChild(dayDiv);
      wrapper.addEventListener("click", () => {
        if (!appState.isEditing) return;
        selectedDay = key;
        selectedEntry = key2;
        editSlot(subjectName, type, timeFrom, timeTo, key2);
      });
    }
    daySlide.appendChild(cardDiv);
    swiperInstance.appendSlide(daySlide);
    swiperInstance.update(); // Update swiper
    swiperInstance.slideTo(0, 0);
  }
}
let currentBatchIndex = 0;
DOM.timeTableSwiper.batchToggleBtn.addEventListener("click", () => {
  switchBatch();
});
function switchBatch() {
  currentBatchIndex = (currentBatchIndex + 1) % (batchList?.length || 1);
  const selectedBatch = batchList?.[currentBatchIndex] || "1";
  DOM.timeTableSwiper.batchToggleBtn.textContent =
    selectedBatch.charAt(0).toUpperCase() + selectedBatch.slice(1);
  DOM.timeTablePopupSwiper.batchToggleBtn.textContent =
    selectedBatch.charAt(0).toUpperCase() + selectedBatch.slice(1);
  document.querySelectorAll(".wrapper[data-batch]").forEach((wrapper) => {
    if (
      wrapper.dataset.batch === "all" ||
      wrapper.dataset.batch === selectedBatch
    ) {
      wrapper.style.display = "";
    } else {
      wrapper.style.display = "none";
    }
  });
}
DOM.timeTablePopupSwiper.batchToggleBtn.addEventListener("click", () => {
  switchBatch();
});

DOM.menuPopup.editPfpBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.accountDetailsPopup.popup);
  await fadeInEffect(pfpSelectionPopup);
});
DOM.menuPopup.logoutBtn.addEventListener("click", async () => {
  showSectionLoader("Logging out...");
  localStorage.removeItem("rememberMe");
  unsubscribeFCM();
  await signOutUser();
});
DOM.menuPopup.accountDetailsBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.menuPopup.popup);
  await fadeInEffect(DOM.accountDetailsPopup.popup);
});
DOM.menuPopup.personalFolderBtn.addEventListener("click", async () => {
  history.pushState({}, "", '?personal-folder=""');
  initRouting();
});
DOM.menuPopup.closePopupBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.menuPopup.popup);
});
DOM.accountDetailsPopup.pfpOverlay.addEventListener("click", async () => {
  await fadeOutEffect(DOM.accountDetailsPopup.popup);
  await fadeInEffect(pfpSelectionPopup);
});
DOM.accountDetailsPopup.userPfp.addEventListener("click", async () => {
  await fadeOutEffect(DOM.accountDetailsPopup.popup);
  await fadeInEffect(pfpSelectionPopup);
});
DOM.menuPopup.userPfp.addEventListener("click", async () => {
  await fadeOutEffect(DOM.menuPopup.popup);
  await fadeInEffect(pfpSelectionPopup);
});
document.addEventListener("click", (e) => {
  if (
    (DOM.menuPopup.popup.classList.contains("hidden") &&
      e.target === DOM.navPfp) ||
    (DOM.menuPopup.popup.classList.contains("hidden") &&
      e.target === pfpElement &&
      !DOM.dashboardSection.classList.contains("hidden"))
  ) {
    fadeInEffect(DOM.menuPopup.popup);
  } else fadeOutEffect(DOM.menuPopup.popup);
});

// account details function and listener
DOM.accountDetailsPopup.closePopupBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.accountDetailsPopup.popup);
  await fadeInEffect(DOM.menuPopup.popup);
});
DOM.accountDetailsPopup.userPfp.addEventListener("click", async () => {
  await fadeOutEffect(DOM.accountDetailsPopup.popup);
  await fadeInEffect(pfpSelectionPopup);
});
DOM.accountDetailsPopup.editPfpBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.accountDetailsPopup.popup);
  await fadeInEffect(pfpSelectionPopup);
});
window.addEventListener("resize", () => {
  if (
    window.innerWidth > 1024 &&
    !DOM.dashboardSection.classList.contains("hidden")
  ) {
    hideElement(headerIcon);
  } else {
    showElement(headerIcon);
  }
});
function initUserInfo() {
  const gold = Number(appState.userData.medalList?.gold || 0) || 0;
  const silver = Number(appState.userData.medalList?.silver || 0) || 0;
  const bronze = Number(appState.userData.medalList?.bronze || 0) || 0;
  const totalPoints = gold * 30 + silver * 20 + bronze * 10;
  DOM.menuPopup.userPfp.src = appState.userData.pfpLink;
  DOM.menuPopup.userName.textContent = `${appState.userData.firstName} ${appState.userData.lastName}`;
  DOM.menuPopup.editPfpBtn.src = appState.userData.pfpLink;
  DOM.menuPopup.medals.gold.textContent = gold;
  DOM.menuPopup.medals.silver.textContent = silver;
  DOM.menuPopup.medals.bronze.textContent = bronze;
  DOM.menuPopup.points.textContent = totalPoints;
  DOM.accountDetailsPopup.userPfp.src = appState.userData.pfpLink;
  DOM.accountDetailsPopup.userName.textContent = `${appState.userData.firstName} ${appState.userData.lastName}`;
  if (appState.userData.role === "student") {
    const [sem, div] = appState.userData.class.split("");
    DOM.accountDetailsPopup.details.division.innerHTML = `Division : <span class="text-text-secondary">${div}</span>`;
    DOM.accountDetailsPopup.details.semester.innerHTML = `Semester : <span class="text-text-secondary">${sem}</span>`;
    DOM.accountDetailsPopup.details.rollNo.innerHTML = `Roll No : <span class="text-text-secondary">${appState.userData.rollNumber}</span>`;
    DOM.accountDetailsPopup.medals.gold.innerHTML = gold;
    DOM.accountDetailsPopup.medals.silver.innerHTML = silver;
    DOM.accountDetailsPopup.medals.bronze.innerHTML = bronze;
    DOM.accountDetailsPopup.points.innerHTML = totalPoints;
  } else if (appState.userData.role === "teacher") {
    hideElement(DOM.accountDetailsPopup.details.division);
    hideElement(DOM.accountDetailsPopup.details.rollNo);
    let classes = Object.keys(appState.userData.assignedClasses).join(", ");
    DOM.accountDetailsPopup.details.semester.innerHTML = `Assigned classes : <span class="text-text-secondary">${classes}</span>`;
  } else {
    hideElement(DOM.accountDetailsPopup.details.division);
    hideElement(DOM.accountDetailsPopup.details.rollNo);
    hideElement(DOM.accountDetailsPopup.details.semester);
  }
  DOM.accountDetailsPopup.details.firstName.innerHTML = `First name : <span class="text-text-secondary">${appState.userData.firstName}</span>`;
  DOM.accountDetailsPopup.details.lastName.innerHTML = `Last name : <span class="text-text-secondary">${appState.userData.lastName}</span>`;
  DOM.accountDetailsPopup.details.email.innerHTML = `Email : <span class="text-text-secondary">${appState.userData.email}</span>`;
}

//send notification
DOM.sendNotificationBtn.addEventListener("click", () => {
  fadeInEffect(DOM.sendNotification.popup);
});
DOM.sendNotification.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.sendNotification.popup);
  resetSendNotification();
});
DOM.sendNotification.inputs.scope.addEventListener("change", () => {
  hideElement(DOM.sendNotification.fakeScopePlaceholder);
});
DOM.sendNotification.inputs.title.addEventListener("input", () => {
  if (DOM.sendNotification.inputs.title.value.length == 21) {
    DOM.sendNotification.errors.title.textContent = "Max 20 characters reached";

    DOM.sendNotification.inputs.title.value =
      DOM.sendNotification.inputs.title.value.slice(0, 20);
    showElement(DOM.sendNotification.errors.title);
  } else {
    hideElement(DOM.sendNotification.errors.title);
  }
});
DOM.sendNotification.successBtn.addEventListener("click", async () => {
  hideElement(DOM.sendNotification.errors.title);
  hideElement(DOM.sendNotification.errors.description);
  hideElement(DOM.sendNotification.errors.scope);
  const title = DOM.sendNotification.inputs.title.value.trim();
  const description = DOM.sendNotification.inputs.description.value.trim();
  const type = DOM.sendNotification.inputs.scope.value;
  let hasError = false;
  let topic;
  if (!title) {
    DOM.sendNotification.errors.title.textContent = "Title is required";
    showElement(DOM.sendNotification.errors.title);
    hasError = true;
  }
  if (!type) {
    DOM.sendNotification.errors.scope.textContent = "Scope is required";
    showElement(DOM.sendNotification.errors.scope);
    hasError = true;
  }
  if (!description) {
    DOM.sendNotification.errors.description.textContent =
      "Description is required";
    showElement(DOM.sendNotification.errors.description);
    hasError = true;
  }
  if (hasError) return;
  showSectionLoader("Sending notification...");
  fadeOutEffect(DOM.sendNotification.popup);

  sendNotification(title, description, type);
  hideSectionLoader();
});
function resetSendNotification() {
  DOM.sendNotification.inputs.title.value = "";
  DOM.sendNotification.inputs.description.value = "";
  DOM.sendNotification.inputs.scope.value = "";
  showElement(DOM.sendNotification.fakeScopePlaceholder);
  hideElement(DOM.sendNotification.errors.title);
  hideElement(DOM.sendNotification.errors.description);
  hideElement(DOM.sendNotification.errors.scope);
}
