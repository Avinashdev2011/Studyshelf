import {
  get,
  ref,
  db,
  updateData,
  query,
  orderByChild,
  equalTo,
  signOutUser,
  pushData,
  writeData,
  deleteData,
} from "./firebase.js";
import {
  showConfirmationPopup,
  showSectionLoader,
  hideSectionLoader,
  initRouting,
  localUserData,
  initClass,
  lottieLoadingScreen,
  hideSections,
} from "./index";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation";
import {
  adminAppState,
  appState,
  syncAdminData,
  getWholeSemesterData,
  initAppState,
} from "./appstate";
import { unsubscribeFCM } from "./notification.js";
import { header, headerIcon, headerTitle } from "./navigation";
import { showErrorSection } from "./error.js";
import { BACKEND_URL } from "./driveApi.js";
const adminSection = document.querySelector(".admin-section");
let activeUserId = null;
let activeUserObj = null;
const DOM = {
  header: document.querySelector("header"),
  headerIcon: document.querySelector(".header-icon"),
  headerTitle: document.querySelector(".header-title"),
  adminSection: document.querySelector(".admin-section"),
  divisionList: document.querySelector(".division-list"),
  divCardContainer: document.querySelector(".div-card-container"),
  classRoom: document.querySelector(".class-room"),
  studentCardContainer: document.querySelector(".student-card-container"),
  teacherCardContainer: document.querySelector(".teacher-card-container"),
  addStudentBtn: document.querySelector(".class-room .add-student-btn"),
  addTeacherBtn: document.querySelector(".class-room .add-teacher-btn"),
  addSubjectBtn: document.querySelector(".class-room .add-subject-btn"),
  subjectCardContainer: document.querySelector(".admin-subject-card-container"),
  activeSemBadge: document.querySelector(".class-room .active-sem-badge"),
  semesterPills: document.querySelector(".class-room .semester-pills"),
  logOutBtn: document.querySelector(".admin-logout-btn"),
  editBtn: document.querySelector(".edit-mode-toggle-btn"),
  personalFolderEditBtn: document.querySelector(
    ".personal-folder-edit-mode-toggle-btn",
  ),
  visitClassRoomBtn: document.querySelector(".visit-class-room-btn"),
  adminBtnWrapper: document.querySelector(".admin-btn-wrapper"),
  addUserPopup: {
    popup: document.querySelector(".add-user-link-popup-wrapper"),
    popupTitle: document.querySelector(
      ".add-user-link-popup-wrapper .popup-title",
    ),
    link: document.querySelector("#add-user-link"),
    form: document.querySelector("#admin-add-student-form"),
    firstName: document.querySelector("#admin-student-first-name"),
    lastName: document.querySelector("#admin-student-last-name"),
    roll: document.querySelector("#admin-student-roll"),
    email: document.querySelector("#admin-student-email"),
    password: document.querySelector("#admin-student-password"),
    error: document.querySelector("#admin-add-student-error"),
    submitBtn: document.querySelector("#admin-add-student-submit-btn"),
    closeBtn: document.querySelector(
      ".add-user-link-popup-wrapper .close-popup-btn",
    ),
  },
  addDivisionPopup: {
    popup: document.querySelector(".add-division-popup-wrapper"),
    input: document.querySelector("#add-division-input"),
    error: document.querySelector(".add-division-popup-wrapper .add-division-error"),
    confirmBtn: document.querySelector(".add-division-popup-wrapper .confirm-btn"),
    cancelBtn: document.querySelector(".add-division-popup-wrapper .cancel-btn"),
    closeBtn: document.querySelector(".add-division-popup-wrapper .close-popup-btn"),
  },
  addSubjectPopup: {
    popup: document.querySelector(".add-subject-popup-wrapper"),
    input: document.querySelector("#admin-subject-name-input"),
    error: document.querySelector(".add-subject-popup-wrapper .add-subject-error"),
    confirmBtn: document.querySelector(".add-subject-popup-wrapper .confirm-btn"),
    cancelBtn: document.querySelector(".add-subject-popup-wrapper .cancel-btn"),
    closeBtn: document.querySelector(".add-subject-popup-wrapper .close-popup-btn"),
    colorPills: document.querySelectorAll(".add-subject-popup-wrapper .color-pill"),
  },
  individualUserPopup: {
    popup: document.querySelector(".individual-user-popup-wrapper"),
    displayName: document.querySelector(
      ".individual-user-popup-wrapper .display-name",
    ),
    firstName: document.querySelector(
      ".individual-user-popup-wrapper .first-name",
    ),
    lastName: document.querySelector(
      ".individual-user-popup-wrapper .last-name",
    ),
    rollNo: document.querySelector(".individual-user-popup-wrapper .roll-no"),
    email: document.querySelector(".individual-user-popup-wrapper .email"),
    assignedClasses: document.querySelector(
      ".individual-user-popup-wrapper .assigned-classes",
    ),
    div: document.querySelector(".individual-user-popup-wrapper .div"),
    role: document.querySelector(".individual-user-popup-wrapper .role"),
    pfp: document.querySelector(".individual-user-popup-wrapper .pfp"),
    closePopupBtn: document.querySelector(
      ".individual-user-popup-wrapper .close-popup-btn",
    ),
    removeUserBtn: document.querySelector(
      ".individual-user-popup-wrapper .remove-user-btn",
    ),
    deleteUserBtn: document.querySelector(
      ".individual-user-popup-wrapper .delete-user-btn",
    ),
  },
  pickTeacherPopup: {
    popup: document.querySelector(".pick-teacher-popup-wrapper"),
    cardContainer: document.querySelector(
      ".pick-teacher-popup-wrapper .card-container",
    ),
    closePopupBtn: document.querySelector(
      ".pick-teacher-popup-wrapper .close-popup-btn",
    ),
  },
  namePopup: {
    popup: document.querySelector(".edit-name-popup-wrapper"),
    inputs: {
      firstName: document.querySelector("#user-first-name-input"),
      lastName: document.querySelector("#user-last-name-input"),
    },
    errors: {
      firstName: document.querySelector(
        ".edit-name-popup-wrapper .first-name-error",
      ),
      lastName: document.querySelector(
        ".edit-name-popup-wrapper .last-name-error",
      ),
    },
    successBtn: document.querySelector(".edit-name-popup-wrapper .success-btn"),
    closePopupBtn: document.querySelector(
      ".edit-name-popup-wrapper .close-popup-btn",
    ),
  },
  rollNoPopup: {
    popup: document.querySelector(".edit-roll-no-popup-wrapper"),
    input: document.querySelector(".edit-roll-no-popup-wrapper .roll-no-input"),
    error: document.querySelector(".edit-roll-no-popup-wrapper .roll-no-error"),
    successBtn: document.querySelector(
      ".edit-roll-no-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-roll-no-popup-wrapper .close-popup-btn",
    ),
  },
  emailPopup: {
    popup: document.querySelector(".edit-email-popup-wrapper"),
    input: document.querySelector(".edit-email-popup-wrapper .email-input"),
    error: document.querySelector(".edit-email-popup-wrapper .email-error"),
    successBtn: document.querySelector(
      ".edit-email-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-email-popup-wrapper .close-popup-btn",
    ),
  },
  rolePopup: {
    popup: document.querySelector(".edit-role-popup-wrapper"),
    input: document.querySelector(".edit-role-popup-wrapper .role-input"),
    error: document.querySelector(".edit-role-popup-wrapper .role-error"),
    successBtn: document.querySelector(".edit-role-popup-wrapper .success-btn"),
    closePopupBtn: document.querySelector(
      ".edit-role-popup-wrapper .close-popup-btn",
    ),
  },
  semDivPopup: {
    popup: document.querySelector(".edit-sem-div-popup-wrapper"),
    inputs: {
      division: document.querySelector(
        ".edit-sem-div-popup-wrapper #student-division-input",
      ),
    },
    errors: {
      division: document.querySelector(
        ".edit-sem-div-popup-wrapper .division-error",
      ),
    },
    successBtn: document.querySelector(
      ".edit-sem-div-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-sem-div-popup-wrapper .close-popup-btn",
    ),
  },
  medalPopup: {
    inputs: {
      gold: document.querySelector(
        ".edit-medal-popup-wrapper .gold-medal-input",
      ),
      silver: document.querySelector(
        ".edit-medal-popup-wrapper .silver-medal-input",
      ),
      bronze: document.querySelector(
        ".edit-medal-popup-wrapper .bronze-medal-input",
      ),
    },
    error: document.querySelector(".edit-medal-popup-wrapper .medal-error"),
    successBtn: document.querySelector(
      ".edit-medal-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-medal-popup-wrapper .close-popup-btn",
    ),
    popup: document.querySelector(".edit-medal-popup-wrapper"),
  },
};

export async function initAdminRouting(userData) {
  // 1. Immediately switch to admin mode and hide login modal
  document.body.classList.add("is-admin");
  const loginSec = document.querySelector(".login-section");
  if (loginSec) {
    loginSec.classList.add("hidden");
    loginSec.style.display = "none";
  }

  showSectionLoader("Loading...", false);

  if (userData) {
    adminAppState.userData = userData;
    adminAppState.userId = userData.id || userData.userId;
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (window.location.search.includes("login")) {
    history.pushState({}, "", "/");
  }
  const sem = urlParams.get("sem") || adminAppState.activeSem || "1";
  const div = urlParams.get("div");
  const subject = urlParams.get("subject");

  adminAppState.activeSem = String(sem);

  hideSections(true, true, false, true);

  if (subject && div) {
    localUserData.userData = userData || localUserData.userData;
    localUserData.isVisitingClass = true;
    localUserData.userData.class = `${sem}${div}`;
    await initAppState(localUserData.userData, sem, div);
    appState.activeSubject = subject;
    appState.isEditing = true;
    await hideAdminDivisions();
    hideElement(DOM.adminSection);
    hideElement(DOM.visitClassRoomBtn);
    await initRouting();
    return;
  }

  showElement(adminSection);
  showElement(DOM.adminBtnWrapper);
  hideElement(DOM.editBtn);
  hideElement(DOM.personalFolderEditBtn);
  DOM.personalFolderEditBtn.textContent = "Edit";
  appState.isEditing = false;

  // 2. Instant load from cache if available
  const cachedData = sessionStorage.getItem("admin_sem_data");
  let hasRenderedFromCache = false;
  if (cachedData && !adminAppState.semesterData) {
    try {
      adminAppState.semesterData = JSON.parse(cachedData);
      if (div && adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[div]) {
        adminAppState.activeDiv = div;
        showClassRoom();
      } else {
        showDivisionList();
      }
      hasRenderedFromCache = true;
    } catch (e) {}
  }

  // 3. Fetch latest data from database
  try {
    const freshData = await getWholeSemesterData();
    if (freshData) {
      adminAppState.semesterData = freshData;
      try {
        sessionStorage.setItem("admin_sem_data", JSON.stringify(freshData));
      } catch (e) {}
    }
  } catch (err) {
    console.error("Error fetching semester data:", err);
  }

  if (div) {
    if (adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[div]) {
      adminAppState.activeDiv = div;
      showClassRoom();
    } else {
      showDivisionList();
    }
  } else {
    showDivisionList();
  }
}

//division section (primary Admin Dashboard view)
async function showDivisionList() {
  await hideAdminDivisions();
  const hdr = DOM.header || document.querySelector("header");
  const hdrIcon = DOM.headerIcon || document.querySelector(".header-icon");
  const hdrTitle = DOM.headerTitle || document.querySelector(".header-title");
  if (hdr) showElement(hdr);
  if (hdrIcon) {
    showElement(hdrIcon);
    hdrIcon.innerHTML = `<i class="fa-solid fa-shapes text-xl text-text-primary"></i>`;
    hdrIcon.classList.remove("bg-primary");
  }
  if (hdrTitle) {
    showElement(hdrTitle);
    hdrTitle.textContent = "Divisions";
    hdrTitle.className = "header-title font-semibold text-2xl";
    hdrTitle.onclick = null;
    hdrTitle.removeAttribute("title");
    hdrTitle.classList.remove("hidden");
  }
  DOM.divCardContainer.innerHTML = "";

  const divisions =
    adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList || {};

  for (const key in divisions) {
    const divisionName = `Div - ${key}`;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 text-text-primary w-full rounded-3xl p-6 text-center font-semibold custom-hover cursor-pointer relative group flex items-center justify-between";

    const label = document.createElement("span");
    label.className = "flex-1 text-center text-lg";
    label.textContent = divisionName;
    card.appendChild(label);

    const deleteBtn = document.createElement("button");
    deleteBtn.className =
      "delete-div-btn text-text-tertiary hover:text-text-error transition-colors p-2 text-base rounded-full hover:bg-surface-3 cursor-pointer";
    deleteBtn.title = `Delete Div - ${key}`;
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const isConfirmed = await showConfirmationPopup(
        `Are you sure you want to delete Division ${key}?`,
      );
      if (!isConfirmed) return;
      showSectionLoader("Deleting division...");
      await deleteData(
        `semesterList/${adminAppState.activeSem}/divisionList/${key}`,
      );
      await syncAdminData();
      await hideSectionLoader();
      showDivisionList();
    });
    card.appendChild(deleteBtn);

    card.addEventListener("click", async () => {
      let activeDiv = key;
      adminAppState.activeDiv = activeDiv;
      history.pushState(
        { div: activeDiv, sem: adminAppState.activeSem },
        "",
        `?div=${encodeURIComponent(activeDiv)}&sem=${adminAppState.activeSem}`,
      );
      showClassRoom();
    });
    DOM.divCardContainer.appendChild(card);
  }

  // Add Division Card
  const addCard = document.createElement("div");
  addCard.className =
    "card border-2 border-dashed border-surface-4 hover:border-primary text-text-secondary hover:text-text-primary w-full rounded-3xl p-6 text-center font-semibold custom-hover cursor-pointer flex items-center justify-center gap-2 transition-all";
  addCard.innerHTML =
    '<i class="fa-solid fa-plus text-lg"></i><span>Add Division</span>';
  addCard.addEventListener("click", () => {
    DOM.addDivisionPopup.input.value = "";
    DOM.addDivisionPopup.error.textContent = "";
    hideElement(DOM.addDivisionPopup.error);
    fadeInEffect(DOM.addDivisionPopup.popup);
    DOM.addDivisionPopup.input.focus();
  });
  DOM.divCardContainer.appendChild(addCard);

  const adminSec = DOM.adminSection || document.querySelector(".admin-section");
  if (adminSec) showElement(adminSec);
  showElement(DOM.divisionList);
  hideSectionLoader(200);
}
async function unloadDivisionList() {
  await fadeOutEffect(DOM.divisionList);
  DOM.divCardContainer.innerHTML = "";
}
// class room section
async function showClassRoom() {
  await showSectionLoader("Loading...", false);
  try {
    await hideAdminDivisions();
    const hdr = DOM.header || document.querySelector("header");
    const hdrIcon = DOM.headerIcon || document.querySelector(".header-icon");
    const hdrTitle = DOM.headerTitle || document.querySelector(".header-title");
    if (hdr) showElement(hdr);
    if (hdrIcon) {
      showElement(hdrIcon);
      hdrIcon.innerHTML = `<i class="fa-solid fa-chalkboard-user text-xl text-text-primary"></i>`;
      hdrIcon.classList.remove("bg-primary");
    }
    if (hdrTitle) {
      showElement(hdrTitle);
      hdrTitle.textContent = `Div - ${adminAppState.activeDiv}`;
      hdrTitle.className = "header-title font-semibold text-2xl cursor-pointer hover:underline";
      hdrTitle.title = "Click to return to divisions";
      hdrTitle.onclick = () => showDivisionList();
    }
    showElement(DOM.visitClassRoomBtn);

    // Back to Divisions button at top of class room
    let backToDivsBtn = DOM.classRoom.querySelector(".back-to-divs-btn");
    if (!backToDivsBtn) {
      backToDivsBtn = document.createElement("button");
      backToDivsBtn.className =
        "back-to-divs-btn w-full text-left text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer pb-2 transition-colors";
      backToDivsBtn.innerHTML =
        '<i class="fa-solid fa-chevron-left text-xs"></i> Back to Divisions';
      backToDivsBtn.addEventListener("click", () => {
        history.pushState({}, "", window.location.pathname);
        showDivisionList();
      });
      DOM.classRoom.insertBefore(backToDivsBtn, DOM.classRoom.firstChild);
    }

    if (
      !adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[
        adminAppState.activeDiv
      ]
    ) {
      showDivisionList();
      return;
    }
    const studentRawData = await getStudentRawData();
    let sortedRollNoWiseStudentData = {};
    let teacherData = await getTeacherData();
    if (studentRawData) {
      sortedRollNoWiseStudentData = Object.entries(studentRawData)
        .sort(([, a], [, b]) => Number(a.rollNumber || 0) - Number(b.rollNumber || 0))
        .reduce((acc, [key, val]) => {
          acc[key] = val;
          return acc;
        }, {});
    } else {
      sortedRollNoWiseStudentData = {};
    }
    if (teacherData) {
      adminAppState.semesterData[adminAppState.activeSem].divisionList[
        adminAppState.activeDiv
      ].teacherList = teacherData;
    }
    adminAppState.semesterData[adminAppState.activeSem].divisionList[
      adminAppState.activeDiv
    ].studentList = sortedRollNoWiseStudentData;
    renderSemesterPills();
    renderIndividualSubjectCard();
    renderIndividualStudentCard();
    renderIndividualTeacherCard();
    renderTeacherCardInPopup();
    const adminSec = DOM.adminSection || document.querySelector(".admin-section");
    if (adminSec) showElement(adminSec);
    showElement(DOM.classRoom);
  } catch (err) {
    console.error("Error in showClassRoom:", err);
  } finally {
    hideSectionLoader(200);
  }
}
async function unloadClassRoom() {
  await fadeOutEffect(DOM.classRoom);
  hideElement(DOM.visitClassRoomBtn);
  const backToDivsBtn = DOM.classRoom.querySelector(".back-to-divs-btn");
  if (backToDivsBtn) backToDivsBtn.remove();
  DOM.studentCardContainer.innerHTML = "";
  DOM.teacherCardContainer.innerHTML = "";
  DOM.pickTeacherPopup.cardContainer.innerHTML = "";
  if (DOM.subjectCardContainer) DOM.subjectCardContainer.innerHTML = "";
  if (DOM.semesterPills) DOM.semesterPills.innerHTML = "";
}

function renderSemesterPills() {
  if (!DOM.semesterPills) {
    DOM.semesterPills = document.querySelector(".class-room .semester-pills");
  }
  if (!DOM.activeSemBadge) {
    DOM.activeSemBadge = document.querySelector(".class-room .active-sem-badge");
  }
  if (!DOM.semesterPills) return;

  DOM.semesterPills.innerHTML = "";

  const availableSemesters =
    adminAppState.semesterData && Object.keys(adminAppState.semesterData).length > 0
      ? Object.keys(adminAppState.semesterData).sort((a, b) => Number(a) - Number(b))
      : ["1", "2", "3", "4", "5", "6"];

  if (DOM.activeSemBadge) {
    DOM.activeSemBadge.textContent = `Sem ${adminAppState.activeSem}`;
  }

  availableSemesters.forEach((sem) => {
    const btn = document.createElement("button");
    const isActive = String(sem) === String(adminAppState.activeSem);
    btn.className = `px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
      isActive
        ? "bg-primary text-on-primary shadow-sm"
        : "bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-surface-3"
    }`;
    btn.textContent = `Sem ${sem}`;
    btn.addEventListener("click", async () => {
      if (String(adminAppState.activeSem) === String(sem)) return;
      adminAppState.activeSem = String(sem);
      history.pushState(
        { div: adminAppState.activeDiv, sem: adminAppState.activeSem },
        "",
        `?div=${encodeURIComponent(adminAppState.activeDiv)}&sem=${adminAppState.activeSem}`,
      );

      // Ensure the active division exists in this semester's data in adminAppState
      if (
        !adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[
          adminAppState.activeDiv
        ]
      ) {
        if (!adminAppState.semesterData[adminAppState.activeSem]) {
          adminAppState.semesterData[adminAppState.activeSem] = {
            divisionList: {},
          };
        }
        if (!adminAppState.semesterData[adminAppState.activeSem].divisionList) {
          adminAppState.semesterData[adminAppState.activeSem].divisionList = {};
        }
        adminAppState.semesterData[adminAppState.activeSem].divisionList[
          adminAppState.activeDiv
        ] = {
          divisionGlobalData: { name: adminAppState.activeDiv },
          batchList: ["1", "2", "3"],
          studentList: {},
          teacherList: {},
        };
      }

      await showClassRoom();
    });
    DOM.semesterPills.appendChild(btn);
  });
}
async function hideAdminDivisions() {
  await unloadDivisionList();
  await unloadClassRoom();
}
// other function
async function getStudentRawData() {
  try {
    const usersRef = ref(db, "userData");
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const allUsers = snapshot.val();
      const targetClass = `${adminAppState.activeSem}${adminAppState.activeDiv}`;
      const filtered = {};
      for (const [key, user] of Object.entries(allUsers)) {
        if (user && user.role === "student" && user.class === targetClass) {
          filtered[key] = user;
        }
      }
      return filtered;
    }
    return {};
  } catch (error) {
    console.error("Error fetching student data:", error);
    return {};
  }
}
async function getTeacherData() {
  try {
    const usersRef = ref(db, "userData");
    const snapshot = await get(usersRef);
    const matchingTeachers = {};
    const allTeachers = {};
    const sem = adminAppState.activeSem;
    const div = adminAppState.activeDiv;
    const targetKey = `${sem}${div}`;
    if (snapshot.exists()) {
      const allUsers = snapshot.val();
      for (const [key, user] of Object.entries(allUsers)) {
        if (user && user.role === "teacher") {
          allTeachers[key] = user;
          if (user.assignedClasses && user.assignedClasses[targetKey]) {
            matchingTeachers[key] = user;
          }
        }
      }
    }
    adminAppState.allTeachers = allTeachers;
    return matchingTeachers;
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    return {};
  }
}
function renderTeacherCardInPopup() {
  for (const key in adminAppState.allTeachers) {
    const element = adminAppState.allTeachers[key];
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 items-center border border-surface-3 p-3 md:px-4 flex justify-between rounded-xl cursor-pointer";
    const wrapper = document.createElement("div");
    wrapper.className =
      "wrapper w-[12rem] md:w-[22rem] gap-1.5 md:gap-4 flex items-center justify-between";
    const namePfpWrapper = document.createElement("div");
    namePfpWrapper.className = "name-pfp-wrapper flex items-center gap-2";

    const img = document.createElement("img");
    img.src = element.pfpLink;
    img.alt = "";
    img.className = "pfp h-10 w-10";

    const nameContainer = document.createElement("div");
    nameContainer.className =
      "flex flex-col leading-tight text-sm md:text-base";

    const firstName = document.createElement("p");
    firstName.className = "truncate w-full";
    firstName.textContent = element.firstName;

    const lastName = document.createElement("p");
    lastName.className = "truncate w-full";
    lastName.textContent = element.lastName;

    nameContainer.appendChild(firstName);
    nameContainer.appendChild(lastName);

    namePfpWrapper.appendChild(img);
    namePfpWrapper.appendChild(nameContainer);

    wrapper.appendChild(namePfpWrapper);
    card.appendChild(wrapper);

    DOM.pickTeacherPopup.cardContainer.appendChild(card);
    card.addEventListener("click", () => {
      addTeacherInClass(key);
    });
  }
  const wrapper = document.createElement("div");
  wrapper.className =
    "p-4 text-center border border-surface-3 rounded-xl cursor-pointer custom-hover";
  wrapper.innerHTML = "Add new teacher account";
  DOM.pickTeacherPopup.cardContainer.appendChild(wrapper);
  wrapper.addEventListener("click", () => {
    const encryptedData = encryptObj({
      division: `${adminAppState.activeDiv}`,
      semester: `${adminAppState.activeSem.replace("semester", "")}`,
      role: "teacher",
    });
    encryptedCode = encryptedData;
    DOM.addUserPopup.link.textContent = encryptedCode;
    DOM.addUserPopup.popupTitle.textContent = `Add teacher`;
    fadeInEffect(DOM.addUserPopup.popup);
  });
}
function renderIndividualStudentCard() {
  DOM.studentCardContainer.innerHTML = "";
  const studentList =
    adminAppState.semesterData[adminAppState.activeSem]?.divisionList?.[
      adminAppState.activeDiv
    ]?.studentList || {};

  const studentKeys = Object.keys(studentList);
  if (studentKeys.length === 0) {
    const emptyCard = document.createElement("div");
    emptyCard.className =
      "bg-surface-2 text-text-secondary w-full rounded-3xl p-6 text-center border border-surface-3 flex flex-col items-center justify-center gap-2";
    emptyCard.innerHTML = `
      <i class="fa-solid fa-user-group text-2xl text-text-tertiary"></i>
      <p class="font-semibold text-text-primary">No students in Div - ${adminAppState.activeDiv} yet</p>
      <p class="text-sm">Click "+ Add student" above to add a student to this class</p>
    `;
    DOM.studentCardContainer.appendChild(emptyCard);
    return;
  }

  for (const key of studentKeys) {
    const student = studentList[key];
    const card = document.createElement("div");
    card.className =
      "individual-student-card bg-surface-2 flex w-full items-center justify-between rounded-3xl px-6 py-5 cursor-pointer custom-hover";
    const wrapper = document.createElement("div");
    wrapper.className = "image-name-wrapper flex items-center gap-3";
    const img = document.createElement("img");
    img.src =
      student.pfpLink ||
      "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png";
    img.alt = "";
    img.className = "pfp h-[45px] w-[45px] lg:h-[50px] lg:w-[50px]";
    const nameP = document.createElement("p");
    nameP.className = "student-name font-medium";
    nameP.textContent = `${student.firstName} ${student.lastName}`;
    wrapper.appendChild(img);
    wrapper.appendChild(nameP);

    const rightWrapper = document.createElement("div");
    rightWrapper.className = "flex items-center gap-4";

    const rollP = document.createElement("p");
    rollP.className = "roll-no text-text-secondary text-sm font-semibold";
    rollP.textContent = student.rollNumber ? `Roll: ${student.rollNumber}` : "";
    rightWrapper.appendChild(rollP);

    const deleteBtn = document.createElement("button");
    deleteBtn.className =
      "delete-student-btn text-text-tertiary hover:text-text-error transition-colors p-2 text-base rounded-full hover:bg-surface-3 cursor-pointer";
    deleteBtn.title = `Remove ${student.firstName}`;
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const isConfirmed = await showConfirmationPopup(
        `Are you sure you want to remove ${student.firstName} ${student.lastName} from class?`,
      );
      if (!isConfirmed) return;
      showSectionLoader("Removing student...");
      await deleteUser(key);
      await deleteData(`userData/${key}`);
      await syncAdminData();
      await hideSectionLoader();
      showClassRoom();
    });
    rightWrapper.appendChild(deleteBtn);

    card.appendChild(wrapper);
    card.appendChild(rightWrapper);

    card.addEventListener("click", () => {
      activeUserId = key;
      activeUserObj = student;
      initIndividualUserPopup();
    });
    DOM.studentCardContainer.appendChild(card);
  }
}
function renderIndividualTeacherCard() {
  for (const key in adminAppState.semesterData[adminAppState.activeSem]
    .divisionList[adminAppState.activeDiv].teacherList) {
    const teacher =
      adminAppState.semesterData[adminAppState.activeSem].divisionList[
        adminAppState.activeDiv
      ].teacherList[key];
    const card = document.createElement("div");
    card.className =
      "individual-teacher-card bg-surface-2 flex w-full items-center justify-between rounded-3xl px-6 py-5 cursor-pointer custom-hover";
    const wrapper = document.createElement("div");
    wrapper.className = "image-name-wrapper flex items-center gap-2";
    const img = document.createElement("img");
    img.src = teacher.pfpLink;
    img.alt = "";
    img.className = "pfp h-[45px] w-[45px] lg:h-[50px] lg:w-[50px]";
    const nameP = document.createElement("p");
    nameP.className = "student-name";
    nameP.textContent = `${teacher.firstName} ${teacher.lastName}`;
    wrapper.appendChild(img);
    wrapper.appendChild(nameP);
    card.appendChild(wrapper);
    card.addEventListener("click", () => {
      activeUserId = teacher.userId;
      activeUserObj = teacher;
      initIndividualUserPopup(true);
    });
    DOM.teacherCardContainer.appendChild(card);
  }
}
async function addTeacherInClass(teacherId) {
  const isConfirm = await showConfirmationPopup(
    "Teacher will be added will have access to the class",
  );
  if (!isConfirm) return;
  showSectionLoader("Updating data...");
  await fadeOutEffect(DOM.pickTeacherPopup.popup);
  const key = `${adminAppState.activeSem.replace("semester", "")}${adminAppState.activeDiv}`;
  await updateData(`userData/${teacherId}/assignedClasses/`, {
    [key]: true,
  });
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  hideAdminDivisions();
  await hideSectionLoader();
  showClassRoom();
}
async function deleteUser(uid) {
  try {
    const response = await fetch(`${BACKEND_URL}/delete-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log("User deleted:", data.message);
    }
  } catch (err) {
    console.warn("Backend user delete warning, falling back to direct DB delete:", err);
  }
  await deleteData(`userData/${uid}`);
}

//add student
let encryptedCode = "";
DOM.addStudentBtn.addEventListener("click", () => {
  const encryptedData = encryptObj({
    division: `${adminAppState.activeDiv}`,
    semester: `${adminAppState.activeSem}`,
    role: "student",
  });
  DOM.addUserPopup.link.textContent = encryptedData;
  encryptedCode = encryptedData;
  DOM.addUserPopup.popupTitle.textContent = `Add Student - Div ${adminAppState.activeDiv}`;
  if (DOM.addUserPopup.form) {
    DOM.addUserPopup.form.reset();
    if (DOM.addUserPopup.password)
      DOM.addUserPopup.password.value = "Student@123";
    if (DOM.addUserPopup.error) hideElement(DOM.addUserPopup.error);
  }
  fadeInEffect(DOM.addUserPopup.popup);
});

if (DOM.addUserPopup.form) {
  DOM.addUserPopup.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = DOM.addUserPopup.firstName.value.trim();
    const lastName = DOM.addUserPopup.lastName.value.trim();
    const rollNumber = DOM.addUserPopup.roll.value.trim();
    const email = DOM.addUserPopup.email.value.trim().toLowerCase();
    const password = DOM.addUserPopup.password.value.trim();

    if (!firstName || !lastName || !email || !password) {
      DOM.addUserPopup.error.textContent = "Please fill all required fields";
      showElement(DOM.addUserPopup.error);
      return;
    }

    showSectionLoader("Adding student...");
    if (DOM.addUserPopup.submitBtn) DOM.addUserPopup.submitBtn.disabled = true;

    try {
      const response = await fetch(`${BACKEND_URL}/create-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          rollNumber,
          email,
          password,
          semester: adminAppState.activeSem,
          division: adminAppState.activeDiv,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        await fadeOutEffect(DOM.addUserPopup.popup);
        await showSectionLoader("Syncing student list...");
        await syncAdminData();
        await hideSectionLoader();
        showClassRoom();
      } else {
        hideSectionLoader();
        DOM.addUserPopup.error.textContent =
          data.error || "Failed to create student";
        showElement(DOM.addUserPopup.error);
      }
    } catch (err) {
      try {
        const studentClass = `${adminAppState.activeSem}${adminAppState.activeDiv}`;
        const tempId = "std_" + Date.now();
        const studentData = {
          id: tempId,
          userId: tempId,
          firstName,
          lastName,
          rollNumber,
          email,
          role: "student",
          class: studentClass,
          theme: "default",
          pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png",
          medalList: { gold: 0, silver: 0, bronze: 0 },
        };
        await writeData(`userData/${tempId}`, studentData);
        await fadeOutEffect(DOM.addUserPopup.popup);
        await syncAdminData();
        await hideSectionLoader();
        showClassRoom();
      } catch (dbErr) {
        hideSectionLoader();
        DOM.addUserPopup.error.textContent = err.message;
        showElement(DOM.addUserPopup.error);
      }
    } finally {
      if (DOM.addUserPopup.submitBtn)
        DOM.addUserPopup.submitBtn.disabled = false;
    }
  });
}

if (DOM.addUserPopup.closeBtn) {
  DOM.addUserPopup.closeBtn.addEventListener("click", () => {
    fadeOutEffect(DOM.addUserPopup.popup);
  });
}

DOM.addTeacherBtn.addEventListener("click", () => {
  fadeInEffect(DOM.pickTeacherPopup.popup);
});
DOM.addUserPopup.link.addEventListener("click", (e) => {
  e.preventDefault();
  navigator.clipboard.writeText(DOM.addUserPopup.link.textContent);
  DOM.addUserPopup.link.textContent = "Copied!";
  setTimeout(() => {
    DOM.addUserPopup.link.textContent = encryptedCode;
  }, 2000);
});
function encryptObj(obj) {
  const str = JSON.stringify(obj);
  let encoded = btoa(str);
  encoded = encoded.match(/.{1,4}/g).join("-");
  return encoded;
}

DOM.logOutBtn.addEventListener("click", () => {
  document.body.classList.remove("is-admin");
  localStorage.removeItem("rememberMe");
  unsubscribeFCM();
  signOutUser();
});
DOM.visitClassRoomBtn.addEventListener("click", async () => {
  fadeInEffect(lottieLoadingScreen);
  localUserData.userData = adminAppState.userData;
  localUserData.isVisitingClass = true;
  localUserData.userData.class = `${adminAppState.activeSem}${
    adminAppState.activeDiv
  }`;
  initClass();
});
DOM.pickTeacherPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.pickTeacherPopup.popup);
});

DOM.individualUserPopup.deleteUserBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this user's account?",
  );
  if (!isConfirmed) return;
  const userId = activeUserId;
  showSectionLoader("Deleting user...");
  await deleteUser(userId);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  await hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
});
DOM.individualUserPopup.removeUserBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to remove this teacher from the class?",
  );
  if (!isConfirmed) return;
  const userId = activeUserId;
  const key = `${adminAppState.activeSem.replace("semester", "")}${adminAppState.activeDiv}`;
  showSectionLoader("Updating data...");
  await fadeOutEffect(DOM.individualUserPopup.popup);
  await updateData(`userData/${userId}/assignedClasses/`, {
    [key]: null,
  });
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  await hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
});

// individual student related
DOM.individualUserPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.individualUserPopup.popup);
});
function initIndividualUserPopup(isTeacher = false) {
  if (isTeacher || activeUserObj?.role === "teacher") {
    const teacher = activeUserObj;
    let assignedClasses = teacher.assignedClasses
      ? Object.keys(teacher.assignedClasses).join(", ")
      : "--";

    DOM.individualUserPopup.firstName.innerHTML = `
  <span class="text-text-primary">First Name:</span>
  <span class="text-text-secondary">${teacher.firstName || ""}</span>
`;

    DOM.individualUserPopup.lastName.innerHTML = `
  <span class="text-text-primary">Last Name:</span>
  <span class="text-text-secondary">${teacher.lastName || ""}</span>
`;

    DOM.individualUserPopup.displayName.innerHTML = `${teacher.firstName || ""} ${teacher.lastName || ""}`;

    DOM.individualUserPopup.email.innerHTML = `
  <span class="text-text-primary">Email:</span>
  <span class="text-text-secondary break-all">${teacher.email || ""}</span>
`;

    DOM.individualUserPopup.assignedClasses.innerHTML = `
  <span class="text-text-primary">Assigned Classes:</span>
  <span class="text-text-secondary break-all">${assignedClasses}</span>
`;

    DOM.individualUserPopup.pfp.src =
      teacher.pfpLink || "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png";

    showElement(DOM.individualUserPopup.assignedClasses);
    hideElement(DOM.individualUserPopup.rollNo);
    hideElement(DOM.individualUserPopup.role);
    hideElement(DOM.individualUserPopup.div);
    showElement(DOM.individualUserPopup.removeUserBtn);
    hideElement(DOM.individualUserPopup.deleteUserBtn);
  } else {
    const student = activeUserObj;
    showElement(DOM.individualUserPopup.rollNo);
    showElement(DOM.individualUserPopup.role);
    showElement(DOM.individualUserPopup.div);
    hideElement(DOM.individualUserPopup.assignedClasses);
    hideElement(DOM.individualUserPopup.removeUserBtn);
    showElement(DOM.individualUserPopup.deleteUserBtn);

    DOM.individualUserPopup.firstName.innerHTML = `
  <span class="text-text-primary">First Name:</span>
  <span class="text-text-secondary">${student.firstName || ""}</span>
`;

    DOM.individualUserPopup.lastName.innerHTML = `
  <span class="text-text-primary">Last Name:</span>
  <span class="text-text-secondary">${student.lastName || ""}</span>
`;

    DOM.individualUserPopup.displayName.innerHTML = `
  ${student.firstName || ""} ${student.lastName || ""}
`;

    DOM.individualUserPopup.rollNo.innerHTML = `
  <span class="text-text-primary">Roll No:</span>
  <span class="text-text-secondary">${student.rollNumber || ""}</span>
`;

    DOM.individualUserPopup.email.innerHTML = `
  <span class="text-text-primary">Email:</span>
  <span class="text-text-secondary">${student.email || ""}</span>
`;

    DOM.individualUserPopup.role.innerHTML = `
  <span class="text-text-primary">Role:</span>
  <span class="text-text-secondary">${student.role ? student.role.charAt(0).toUpperCase() + student.role.slice(1) : "Student"}</span>
`;

    const classStr =
      student.class || `${adminAppState.activeSem}${adminAppState.activeDiv}`;
    const div = classStr.replace(/^\d+/, "") || classStr;
    DOM.individualUserPopup.div.innerHTML = `
  <span class="text-text-primary">Division:</span>
  <span class="text-text-secondary">${div.toUpperCase()}</span>
`;
    DOM.individualUserPopup.pfp.src =
      student.pfpLink || "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png";
  }
  fadeInEffect(DOM.individualUserPopup.popup);
}
//first name last name
DOM.individualUserPopup.firstName.addEventListener("click", () => {
  DOM.namePopup.inputs.firstName.value = activeUserObj.firstName;
  DOM.namePopup.inputs.lastName.value = activeUserObj.lastName;
  fadeInEffect(DOM.namePopup.popup);
});
DOM.individualUserPopup.lastName.addEventListener("click", () => {
  DOM.namePopup.inputs.firstName.value = activeUserObj.firstName;
  DOM.namePopup.inputs.lastName.value = activeUserObj.lastName;
  fadeInEffect(DOM.namePopup.popup);
});
DOM.namePopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.namePopup.popup);
});
DOM.namePopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.namePopup.errors.firstName);
  fadeOutEffect(DOM.namePopup.errors.lastName);
  const firstName = DOM.namePopup.inputs.firstName.value.trim();
  const lastName = DOM.namePopup.inputs.lastName.value.trim();
  let isError = false;
  if (!firstName) {
    DOM.namePopup.errors.firstName.textContent = "First Name is required";
    fadeInEffect(DOM.namePopup.errors.firstName);
    isError = true;
  }
  if (!lastName) {
    DOM.namePopup.errors.lastName.textContent = "Last Name is required";
    fadeInEffect(DOM.namePopup.errors.lastName);
    isError = true;
  }
  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the name of the student. Are you sure?",
  );
  if (!isConfirmed) return;
  await showSectionLoader("Updating name...");
  await updateData(`userData/${activeUserId}`, {
    firstName: firstName,
    lastName: lastName,
  });
  await fadeOutEffect(DOM.namePopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  await hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
});

// roll no
DOM.individualUserPopup.rollNo.addEventListener("click", () => {
  DOM.rollNoPopup.input.value = activeUserObj.rollNumber;
  fadeInEffect(DOM.rollNoPopup.popup);
});
DOM.rollNoPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.rollNoPopup.popup);
});
DOM.rollNoPopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.rollNoPopup.error);
  const rollNo = Number(DOM.rollNoPopup.input.value.trim());
  const length = DOM.rollNoPopup.input.value.trim().length;
  let isError = false;
  if (length < 6) {
    DOM.rollNoPopup.error.textContent = "Roll No must be 6 digits";
    fadeInEffect(DOM.rollNoPopup.error);
    return;
  }
  if (rollNo < 0) {
    DOM.rollNoPopup.error.textContent = "Roll No is required";
    fadeInEffect(DOM.rollNoPopup.error);
    return;
  }
  if (rollNo) {
    try {
      showSectionLoader("Checking rollno...");
      const q = query(
        ref(db, "userData"),
        orderByChild("rollNumber"),
        equalTo(rollNo),
      );
      await get(q).then(async (snapshot) => {
        if (snapshot.exists()) {
          DOM.rollNoPopup.error.textContent = "Roll No already exists";
          fadeInEffect(DOM.rollNoPopup.error);
          hideSectionLoader();
          isError = true;
          return;
        } else {
          hideSectionLoader();
          const isConfirmed = await showConfirmationPopup(
            "This will change the roll no of the student. Are you sure?",
          );
          if (!isConfirmed) return;
          else {
            showSectionLoader("Updating roll number...");
            await updateData(`userData/${activeUserId}`, {
              rollNumber: rollNo,
            });
            fadeOutEffect(DOM.rollNoPopup.popup);
          }
        }
      });
      if (isError) return;
    } catch (error) {
      showErrorSection("Error updating roll number", error);
    }
  }
  await fadeOutEffect(DOM.rollNoPopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  await hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
});

// role
DOM.individualUserPopup.role.addEventListener("click", () => {
  if (activeUserObj.role === "student") DOM.rolePopup.input.value = "student";
  else if (activeUserObj.role === "editor")
    DOM.rolePopup.input.value = "editor";
  fadeInEffect(DOM.rolePopup.popup);
});
DOM.rolePopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.rolePopup.popup);
});
DOM.rolePopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.rolePopup.error);
  const role = DOM.rolePopup.input.value.trim();
  if (!role) {
    DOM.rolePopup.error.textContent = "Role is required";
    fadeInEffect(DOM.rolePopup.error);
    return;
  }
  const isConfirmed = await showConfirmationPopup(
    "This will change the role of the student and their permissions. Are you sure?",
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating role...");
    await updateData(`userData/${activeUserId}`, {
      role: role,
    });
    fadeOutEffect(DOM.rolePopup.popup);
  }
  await fadeOutEffect(DOM.rolePopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  await hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
});

// change division
DOM.individualUserPopup.div.addEventListener("click", () => {
  const classStr =
    activeUserObj.class || `${adminAppState.activeSem}${adminAppState.activeDiv}`;
  const currentDiv =
    classStr.replace(/^\d+/, "") || activeUserObj.division || adminAppState.activeDiv;

  // populate division options from current divisions
  const divisions =
    adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList || {};
  const divSelect = DOM.semDivPopup.inputs.division;
  divSelect.innerHTML = "";
  for (const key in divisions) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `Division ${key}`;
    if (key === currentDiv) opt.selected = true;
    divSelect.appendChild(opt);
  }

  fadeInEffect(DOM.semDivPopup.popup);
});
DOM.semDivPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.semDivPopup.popup);
});
DOM.semDivPopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.semDivPopup.errors.division);
  const div = DOM.semDivPopup.inputs.division.value.trim();
  if (!div) {
    DOM.semDivPopup.errors.division.textContent = "Division is required";
    fadeInEffect(DOM.semDivPopup.errors.division);
    return;
  }
  const isConfirmed = await showConfirmationPopup(
    `This will change the division of the student to Div - ${div}. Are you sure?`,
  );
  if (!isConfirmed) return;
  showSectionLoader("Updating division...");
  await updateData(`userData/${activeUserId}`, {
    class: `${adminAppState.activeSem}${div}`,
  });
  await fadeOutEffect(DOM.semDivPopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  await showSectionLoader("Syncing data...");
  await syncAdminData();
  await hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
});

//medals (legacy, if present)
if (DOM.individualUserPopup?.medalPointWrapper && DOM.medalPopup?.popup) {
  DOM.individualUserPopup.medalPointWrapper.addEventListener("click", () => {
    DOM.medalPopup.inputs.gold.value =
      DOM.individualUserPopup.medals?.gold?.textContent || 0;
    DOM.medalPopup.inputs.silver.value =
      DOM.individualUserPopup.medals?.silver?.textContent || 0;
    DOM.medalPopup.inputs.bronze.value =
      DOM.individualUserPopup.medals?.bronze?.textContent || 0;
    fadeInEffect(DOM.medalPopup.popup);
  });
}
if (DOM.medalPopup?.closePopupBtn) {
  DOM.medalPopup.closePopupBtn.addEventListener("click", () => {
    fadeOutEffect(DOM.medalPopup.popup);
  });
}
if (DOM.medalPopup?.successBtn) {
  DOM.medalPopup.successBtn.addEventListener("click", async () => {
    fadeOutEffect(DOM.medalPopup.error);
    const gold = Number(DOM.medalPopup.inputs.gold.value.trim());
    const silver = Number(DOM.medalPopup.inputs.silver.value.trim());
    const bronze = Number(DOM.medalPopup.inputs.bronze.value.trim());
    let isError = false;
    if (gold > 5) {
      DOM.medalPopup.error.textContent = "Gold medal cannot be more than 5";
      fadeInEffect(DOM.medalPopup.error);
      isError = true;
    }
    if (silver > 5) {
      DOM.medalPopup.error.textContent = "Silver medal cannot be more than 5";
      fadeInEffect(DOM.medalPopup.error);
      isError = true;
    }
    if (bronze > 5) {
      DOM.medalPopup.error.textContent = "Bronze medal cannot be more than 5";
      fadeInEffect(DOM.medalPopup.error);
      isError = true;
    }

    if (isError) return;
    const isConfirmed = await showConfirmationPopup(
      "This will change the medal counts for the student. Are you sure?",
    );
    if (!isConfirmed) return;
    else {
      showSectionLoader("Updating medals...");
      await updateData(`userData/${activeUserId}/medalList`, {
        gold: gold,
        silver: silver,
        bronze: bronze,
      });
      fadeOutEffect(DOM.medalPopup.popup);
    }
    await fadeOutEffect(DOM.medalPopup.popup);
    await fadeOutEffect(DOM.individualUserPopup.popup);
    await showSectionLoader("Syncing data...");
    await syncAdminData();
    await hideAdminDivisions();
    await hideSectionLoader();
    await showClassRoom();
  });
}

// Add Division Popup listeners
DOM.addDivisionPopup.confirmBtn.addEventListener("click", async () => {
  const rawValue = DOM.addDivisionPopup.input.value.trim().toUpperCase();
  if (!rawValue) {
    DOM.addDivisionPopup.error.textContent = "Division name is required";
    showElement(DOM.addDivisionPopup.error);
    return;
  }
  if (!/^[A-Z0-9]{1,5}$/.test(rawValue)) {
    DOM.addDivisionPopup.error.textContent =
      "Only alphanumeric letters (1-5 chars)";
    showElement(DOM.addDivisionPopup.error);
    return;
  }

  const existingDivs =
    adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList || {};
  if (existingDivs[rawValue]) {
    DOM.addDivisionPopup.error.textContent = `Div - ${rawValue} already exists`;
    showElement(DOM.addDivisionPopup.error);
    return;
  }

  showSectionLoader("Adding division...");
  const newDivisionData = {
    divisionGlobalData: { name: rawValue },
    batchList: {
      "1": "1",
      "2": "2",
      "3": "3",
    },
    subjectList: {},
    subjectMetaDataList: {},
    noticeData: { divisionNoticeList: {} },
    timetableDayList: {
      Monday: { slotList: {} },
      Tuesday: { slotList: {} },
      Wednesday: { slotList: {} },
      Thursday: { slotList: {} },
      Friday: { slotList: {} },
      Saturday: { slotList: {} },
    },
    upcomingSubmissionData: {},
  };

  await writeData(
    `semesterList/${adminAppState.activeSem}/divisionList/${rawValue}`,
    newDivisionData,
  );
  await syncAdminData();
  await fadeOutEffect(DOM.addDivisionPopup.popup);
  await hideSectionLoader();
  showDivisionList();
});

DOM.addDivisionPopup.cancelBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.addDivisionPopup.popup);
});

DOM.addDivisionPopup.closeBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.addDivisionPopup.popup);
});

DOM.addDivisionPopup.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    DOM.addDivisionPopup.confirmBtn.click();
  }
});

// Subject management functions and listeners
function generateSubjectSvg(name, colorKey = "indigo") {
  const colorMap = {
    indigo: ["#6366F1", "#4338CA"],
    amber: ["#F59E0B", "#B45309"],
    emerald: ["#10B981", "#047857"],
    sky: ["#0EA5E9", "#0369A1"],
    blue: ["#3B82F6", "#1D4ED8"],
    rose: ["#F43F5E", "#BE123C"],
    purple: ["#A855F7", "#6B21A8"],
    teal: ["#14B8A6", "#0F766E"],
  };
  const [c1, c2] = colorMap[colorKey] || colorMap.indigo;
  const initial = (name || "S").trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="g_${colorKey}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#g_${colorKey})"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="28">${initial}</text>
  </svg>`.replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderIndividualSubjectCard() {
  if (!DOM.subjectCardContainer) return;
  DOM.subjectCardContainer.innerHTML = "";
  const subjects =
    adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[
      adminAppState.activeDiv
    ]?.subjectMetaDataList || {};

  const keys = Object.keys(subjects);
  if (keys.length === 0) {
    const emptyP = document.createElement("p");
    emptyP.className = "text-text-secondary text-sm p-4 w-full";
    emptyP.textContent = "No subjects added yet. Click + to add a subject.";
    DOM.subjectCardContainer.appendChild(emptyP);
    return;
  }

  keys.forEach((key) => {
    const subj = subjects[key];
    if (!subj) return;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 border-surface-3 flex items-center justify-between gap-3 rounded-2xl border p-3.5 pr-4 min-w-[12rem] cursor-pointer hover:bg-surface-3 transition-colors";

    const left = document.createElement("div");
    left.className = "flex items-center gap-3";
    const img = document.createElement("img");
    img.src = subj.iconLink;
    img.alt = subj.name;
    img.className = "w-9 h-9 rounded-xl shrink-0 object-contain";
    const nameP = document.createElement("p");
    nameP.className = "font-semibold text-text-primary text-base";
    nameP.textContent = subj.name;
    left.appendChild(img);
    left.appendChild(nameP);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "text-text-secondary hover:text-red-400 p-1.5 transition-colors cursor-pointer";
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can text-base"></i>';
    deleteBtn.title = "Delete subject";
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const confirm = await showConfirmationPopup(`Are you sure you want to delete "${subj.name}" from this division?`);
      if (!confirm) return;
      await showSectionLoader("Deleting subject...");
      await deleteData(`semesterList/${adminAppState.activeSem}/divisionList/${adminAppState.activeDiv}/subjectMetaDataList/${key}`);
      await deleteData(`semesterList/${adminAppState.activeSem}/divisionList/${adminAppState.activeDiv}/subjectList/${key}`);
      if (adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[adminAppState.activeDiv]?.subjectMetaDataList) {
        delete adminAppState.semesterData[adminAppState.activeSem].divisionList[adminAppState.activeDiv].subjectMetaDataList[key];
      }
      await hideSectionLoader();
      renderIndividualSubjectCard();
    });

    card.addEventListener("click", async () => {
      await showSectionLoader("Loading subject...");
      await hideAdminDivisions();
      hideElement(DOM.adminSection);
      hideElement(DOM.visitClassRoomBtn);
      localUserData.userData = adminAppState.userData || localUserData.userData;
      localUserData.isVisitingClass = true;
      localUserData.userData.class = `${adminAppState.activeSem}${adminAppState.activeDiv}`;
      await initAppState(
        localUserData.userData,
        adminAppState.activeSem,
        adminAppState.activeDiv,
      );
      appState.activeSubject = subj.name;
      appState.isEditing = true;
      history.pushState(
        {},
        "",
        `?subject=${encodeURIComponent(subj.name)}&sem=${adminAppState.activeSem}&div=${adminAppState.activeDiv}`,
      );
      await initRouting();
      await hideSectionLoader();
    });

    card.appendChild(left);
    card.appendChild(deleteBtn);
    DOM.subjectCardContainer.appendChild(card);
  });
}

let selectedSubjectColor = "indigo";
DOM.addSubjectPopup.colorPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    DOM.addSubjectPopup.colorPills.forEach((p) => {
      p.classList.remove("ring-2", "ring-white", "ring-offset-2", "ring-offset-surface-2");
    });
    pill.classList.add("ring-2", "ring-white", "ring-offset-2", "ring-offset-surface-2");
    selectedSubjectColor = pill.dataset.color || "indigo";
  });
});

DOM.addSubjectBtn.addEventListener("click", () => {
  DOM.addSubjectPopup.input.value = "";
  hideElement(DOM.addSubjectPopup.error);
  fadeInEffect(DOM.addSubjectPopup.popup);
  DOM.addSubjectPopup.input.focus();
});

DOM.addSubjectPopup.closeBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.addSubjectPopup.popup);
});

DOM.addSubjectPopup.cancelBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.addSubjectPopup.popup);
});

DOM.addSubjectPopup.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    DOM.addSubjectPopup.confirmBtn.click();
  }
});

DOM.addSubjectPopup.confirmBtn.addEventListener("click", async () => {
  const name = DOM.addSubjectPopup.input.value.trim();
  hideElement(DOM.addSubjectPopup.error);
  if (!name) {
    DOM.addSubjectPopup.error.textContent = "Subject name is required";
    showElement(DOM.addSubjectPopup.error);
    return;
  }

  showSectionLoader("Adding subject...");
  const iconLink = generateSubjectSvg(name, selectedSubjectColor);
  const subjectObj = {
    name,
    iconLink,
  };

  await writeData(
    `semesterList/${adminAppState.activeSem}/divisionList/${adminAppState.activeDiv}/subjectMetaDataList/${name}`,
    subjectObj,
  );

  // Initialize empty container list
  await writeData(
    `semesterList/${adminAppState.activeSem}/divisionList/${adminAppState.activeDiv}/subjectList/${name}/containerList`,
    {},
  );

  if (!adminAppState.semesterData[adminAppState.activeSem]) {
    adminAppState.semesterData[adminAppState.activeSem] = { divisionList: {} };
  }
  if (!adminAppState.semesterData[adminAppState.activeSem].divisionList[adminAppState.activeDiv]) {
    adminAppState.semesterData[adminAppState.activeSem].divisionList[adminAppState.activeDiv] = {};
  }
  if (!adminAppState.semesterData[adminAppState.activeSem].divisionList[adminAppState.activeDiv].subjectMetaDataList) {
    adminAppState.semesterData[adminAppState.activeSem].divisionList[adminAppState.activeDiv].subjectMetaDataList = {};
  }
  adminAppState.semesterData[adminAppState.activeSem].divisionList[adminAppState.activeDiv].subjectMetaDataList[name] = subjectObj;

  await syncAdminData();
  await fadeOutEffect(DOM.addSubjectPopup.popup);
  await hideSectionLoader();
  renderIndividualSubjectCard();
});

window.addEventListener("popstate", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const subject = urlParams.get("subject");
  if (subject) return; // Handled by index.js routing

  const div = urlParams.get("div");
  const sem = urlParams.get("sem") || adminAppState.activeSem || "1";
  adminAppState.activeSem = String(sem);
  if (
    div &&
    adminAppState.semesterData?.[adminAppState.activeSem]?.divisionList?.[div]
  ) {
    adminAppState.activeDiv = div;
    showClassRoom();
  } else {
    showDivisionList();
  }
});


