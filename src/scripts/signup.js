import {
  hideElement,
  showElement,
  fadeInEffect,
  fadeOutEffect,
  fadeInEffectOpacity,
  fadeOutEffectOpacity,
} from "./animation";
import { malePfpLinks, femalePfpLinks, commonPfpLinks } from "./avatars.js";
import {
  getDatabase,
  auth,
  ref,
  set,
  get,
  db,
  onValue,
  query,
  orderByChild,
  equalTo,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "./firebase.js";
import {
  isNewUser,
  showSectionLoader,
  hideSectionLoader,
  hideSections,
} from "./index.js";
import { showErrorSection } from "./error";
import { initTheme, setLoaderProperties } from "./theme.js";
import { showLoginSection } from "./login.js";
import { trackSignup } from "./posthog.js";
const DOM = {
  loginSection: document.querySelector(".login-section"),
  createAccountLink: document.querySelector(".create-account-link"),
  classCodePopup: {
    popup: document.querySelector(".class-code-popup-wrapper"),
    input: document.querySelector("#class-code-input"),
    successBtn: document.querySelector(
      ".class-code-popup-wrapper .success-btn",
    ),
    error: document.querySelector(".class-code-popup-wrapper .code-error"),
    btnLoader: document.querySelector(".class-code-popup-wrapper .btn-loader"),
    btnText: document.querySelector(".class-code-popup-wrapper .btn-text"),
    closeBtn: document.querySelector(
      ".class-code-popup-wrapper .close-popup-btn",
    ),
  },
  intro: {
    section: document.querySelector(".intro-section"),
    images: {
      1: document.querySelector(".intro-1"),
      2: document.querySelector(".intro-2"),
      3: document.querySelector(".intro-3"),
      4: document.querySelector(".intro-4"),
    },
    nextBtns: {
      1: document.querySelector("#intro-1-next-btn"),
      2: document.querySelector("#intro-2-next-btn"),
      3: document.querySelector("#intro-3-next-btn"),
      4: document.querySelector("#intro-4-next-btn"),
    },
    previousBtns: {
      2: document.querySelector("#intro-2-prev-btn"),
      3: document.querySelector("#intro-3-prev-btn"),
      4: document.querySelector("#intro-4-prev-btn"),
    },
  },
  userDetails: {
    section: document.querySelector(".student-details-section"),
    form: document.querySelector("#student-details-form"),
    nextBtn: document.querySelector(".student-details-section .next-btn"),
    previousBtn: document.querySelector(".student-details-section .prev-btn"),
    btnLoader: document.querySelector(
      ".student-details-section .next-btn .btn-loader",
    ),
    btnText: document.querySelector(
      ".student-details-section .next-btn .btn-text",
    ),
    rollNoWrapper: document.querySelector(".roll-no-input-wrapper"),
    inputs: {
      firstName: document.querySelector("#first-name-input"),
      lastName: document.querySelector("#last-name-input"),
      rollNumber: document.querySelector("#roll-no-input"),
    },
    errors: {
      firstName: document.querySelector(".first-name-related-error"),
      lastName: document.querySelector(".last-name-related-error"),
      rollNumber: document.querySelector(".roll-no-related-error"),
    },
  },
  userCredentials: {
    section: document.querySelector(".student-credentials-section"),
    form: document.querySelector("#student-credentials-form"),
    nextBtn: document.querySelector(".student-credentials-section .next-btn"),
    previousBtn: document.querySelector(
      ".student-credentials-section .prev-btn",
    ),
    btnLoader: document.querySelector(
      ".student-credentials-section .next-btn .btn-loader",
    ),
    btnText: document.querySelector(
      ".student-credentials-section .next-btn .btn-text",
    ),
    inputs: {
      email: document.querySelector("#sign-up-email-input"),
      password: document.querySelector("#sign-up-password-input"),
      confirmPassword: document.querySelector(
        "#sign-up-confirm-password-input",
      ),
    },
    errors: {
      email: document.querySelector(".email-related-error"),
      password: document.querySelector(".password-related-error"),
      confirmPassword: document.querySelector(
        ".confirm-password-related-error",
      ),
    },
  },
  pfpSelection: {
    section: document.querySelector(".pfp-selection-section"),
    form: document.querySelector("#signup-pfp-selection-form"),

    previousBtn: document.querySelector(".pfp-selection-section .prev-btn"),
    maleToggleBtn: document.querySelector(
      ".pfp-selection-section .male-pfp-toggle-btn",
    ),
    femaleToggleBtn: document.querySelector(
      ".pfp-selection-section .female-pfp-toggle-btn",
    ),
    selectedPfpWrapper: document.querySelector(
      ".pfp-selection-section .selected-pfp-wrapper",
    ),
    selectedPfp: document.querySelector(
      ".pfp-selection-section .selected-pfp-wrapper img",
    ),
    pfpContainer: document.querySelector(
      ".pfp-selection-section .pfp-container",
    ),
    pfpArr: {
      male: [],
      female: [],
      common: [],
    },
  },
  summaryForm: {
    section: document.querySelector(".summary-section"),
    form: document.querySelector("#summary-form"),
    nextBtn: document.querySelector(".summary-section .next-btn"),
    previousBtn: document.querySelector(".summary-section .prev-btn"),
    btnLoader: document.querySelector(".summary-section .next-btn .btn-loader"),
    btnText: document.querySelector(".summary-section .next-btn .btn-text"),
    rollNoWrapper: document.querySelector(".final-roll-no-wrapper"),
    details: {
      name: document.querySelector("#final-name"),
      rollNo: document.querySelector("#final-roll-no"),
      email: document.querySelector("#final-email"),
      pfp: document.querySelector("#final-pfp"),
      semester: document.querySelector("#final-sem"),
      division: document.querySelector("#final-div"),
    },
  },
  successScreen: document.querySelector(".success-screen"),
  successLottiePlayer: document.querySelector("#success-lottie-animation"),
  successText: document.querySelector(".success-text"),
  successWrapper: document.querySelector(".success-wrapper"),
};
let userObj = {
  firstName: "",
  lastName: "",
  rollNumber: "",
  email: "",
  pfpLink: "",
  role: "student",
  semester: "1",
  division: "a",
  theme: "default",
  userId: "",
  medalList: {
    gold: "",
    silver: "",
    bronze: "",
  },
};
DOM.createAccountLink.addEventListener("click", () => {
  fadeInEffect(DOM.classCodePopup.popup);
});
DOM.classCodePopup.successBtn.addEventListener("click", async () => {
  const classCode = DOM.classCodePopup.input.value;
  if (classCode === "") {
    DOM.classCodePopup.error.textContent = "Required";
    showElement(DOM.classCodePopup.error);
    return;
  }
  showSectionLoader("Checking code");
  const decryptedData = decryptObj(classCode);
  if (!decryptedData) {
    hideSectionLoader();
    DOM.classCodePopup.error.textContent = "Invalid class code format.";
    showElement(DOM.classCodePopup.error);
    return;
  }
  initTheme("default");
  setLoaderProperties();
  userObj.division = decryptedData.division;
  userObj.semester = Number(
    decryptedData.semester.replace("semester", "").trim(),
  );
  if (decryptedData.role === "teacher") {
    userObj.role = "teacher";
    userObj.assignedClasses = {
      [`${userObj.semester}${userObj.division}`]: true,
    };
    hideElement(DOM.userDetails.rollNoWrapper);
    hideElement(DOM.summaryForm.rollNoWrapper);
  }
  await preloadIntroImages();
  hideSectionLoader();
  await fadeOutEffect(DOM.classCodePopup.popup);
  DOM.classCodePopup.input.value = "";
  hideElement(DOM.classCodePopup.error);
  await hideSections(false, false, false, false);
  history.pushState({}, "", "/?signup=''");
  fadeInEffect(DOM.intro.section);
  DOM.classCodePopup.input.value = "";
});
DOM.classCodePopup.closeBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.classCodePopup.popup);
});
function decryptObj(formattedStr) {
  try {
    const cleaned = formattedStr.replace(/-/g, "").trim();
    const str = atob(cleaned);
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

// intro section functions and listeners
async function preloadIntroImages() {
  const images = [
    document.querySelector(".intro-img-1"),
    document.querySelector(".intro-img-2"),
    document.querySelector(".intro-img-3"),
    document.querySelector(".intro-img-4"),
  ];
  await Promise.all(
    images.map((img) => {
      if (!img) return Promise.resolve();
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve);
        img.addEventListener("error", resolve);
      });
    }),
  );
}
DOM.intro.nextBtns[1].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.images[1]);
  fadeInEffect(DOM.intro.images[2]);
});
DOM.intro.nextBtns[2].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.images[2]);
  fadeInEffect(DOM.intro.images[3]);
});
DOM.intro.nextBtns[3].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.images[3]);
  fadeInEffect(DOM.intro.images[4]);
});
DOM.intro.nextBtns[4].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.section);
  fadeInEffect(DOM.userDetails.section);
});
DOM.intro.previousBtns[2].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.images[2]);
  fadeInEffect(DOM.intro.images[1]);
});
DOM.intro.previousBtns[3].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.images[3]);
  fadeInEffect(DOM.intro.images[2]);
});
DOM.intro.previousBtns[4].addEventListener("click", async () => {
  await fadeOutEffect(DOM.intro.images[4]);
  fadeInEffect(DOM.intro.images[3]);
});
// student details listener
DOM.userDetails.inputs.rollNumber.addEventListener("input", (e) => {
  if (e.target.value.length > 6) {
    DOM.userDetails.errors.rollNumber.textContent =
      "Roll no must be 6 characters";
    e.target.value = e.target.value.slice(0, 6);
    showElement(DOM.userDetails.errors.rollNumber);
  } else if (e.target.value.length < 6) {
    DOM.userDetails.errors.rollNumber.textContent = "";
    hideElement(DOM.userDetails.errors.rollNumber);
  }
});
DOM.userDetails.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideElement(DOM.userDetails.errors.firstName);
  hideElement(DOM.userDetails.errors.lastName);
  hideElement(DOM.userDetails.errors.rollNumber);
  const firstName = DOM.userDetails.inputs.firstName.value.trim();
  const lastName = DOM.userDetails.inputs.lastName.value.trim();
  const rollNoStr = DOM.userDetails.inputs.rollNumber.value.trim();
  const rollNo = Number(rollNoStr);
  let isError = false;
  if (!firstName) {
    DOM.userDetails.errors.firstName.textContent = "First Name is required";
    showElement(DOM.userDetails.errors.firstName);
    isError = true;
  }
  if (!lastName) {
    DOM.userDetails.errors.lastName.textContent = "Last Name is required";
    showElement(DOM.userDetails.errors.lastName);
    isError = true;
  }
  if (!rollNoStr && userObj.role !== "teacher") {
    DOM.userDetails.errors.rollNumber.textContent = "Roll No is required";
    showElement(DOM.userDetails.errors.rollNumber);
    isError = true;
  }
  if (isError) return;
  if (rollNoStr.length < 6 && userObj.role !== "teacher") {
    DOM.userDetails.errors.rollNumber.textContent =
      "Roll No must be at least 6 characters";
    showElement(DOM.userDetails.errors.rollNumber);
    isError = true;
  }
  if (isError) return;
  if (rollNoStr && userObj.role !== "teacher") {
    DOM.userDetails.nextBtn.disabled = true;
    await fadeOutEffectOpacity(DOM.userDetails.btnText);
    fadeInEffect(DOM.userDetails.btnLoader);
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollNo),
    );
    await get(q)
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          DOM.userDetails.errors.rollNumber.textContent =
            "Roll No already exists";
          showElement(DOM.userDetails.errors.rollNumber);
          isError = true;
        }
      })
      .catch((error) => {
        showErrorSection("Error checking roll number:", error);
        isError = true;
      });
  }
  if (isError) {
    await fadeOutEffect(DOM.userDetails.btnLoader);
    fadeInEffectOpacity(DOM.userDetails.btnText);
    DOM.userDetails.nextBtn.disabled = false;
    return;
  } else {
    await fadeOutEffect(DOM.userDetails.btnLoader);
    await fadeInEffectOpacity(DOM.userDetails.btnText);
    userObj.firstName = firstName;
    userObj.lastName = lastName;
    userObj.rollNumber = rollNo;
    if (userObj.role === "teacher") {
      userObj.rollNumber = null;
      userObj.medalList = null;
    }
    await fadeOutEffect(DOM.userDetails.section);
    fadeInEffect(DOM.userCredentials.section);
    DOM.userDetails.nextBtn.disabled = false;
  }
});
// students credentials listener
DOM.userCredentials.previousBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.userCredentials.section);
  fadeInEffect(DOM.userDetails.section);
  hideElement(DOM.userCredentials.errors.email);
  hideElement(DOM.userCredentials.errors.password);
  hideElement(DOM.userCredentials.errors.confirmPassword);
});
DOM.userCredentials.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideElement(DOM.userCredentials.errors.email);
  hideElement(DOM.userCredentials.errors.password);
  hideElement(DOM.userCredentials.errors.confirmPassword);
  const email = DOM.userCredentials.inputs.email.value.trim();
  const password = DOM.userCredentials.inputs.password.value.trim();
  const confirmPassword =
    DOM.userCredentials.inputs.confirmPassword.value.trim();
  let isError = false;
  if (!email) {
    DOM.userCredentials.errors.email.textContent = "Email is required";
    showElement(DOM.userCredentials.errors.email);
    isError = true;
  }
  if (!password) {
    DOM.userCredentials.errors.password.textContent = "Password is required";
    showElement(DOM.userCredentials.errors.password);
    isError = true;
  }
  if (!confirmPassword) {
    DOM.userCredentials.errors.confirmPassword.textContent =
      "Confirm Password is required";
    showElement(DOM.userCredentials.errors.confirmPassword);
    isError = true;
  }
  if (isError) return;
  if (password.length < 6) {
    DOM.userCredentials.errors.password.textContent =
      "Password must be at least 6 characters";
    showElement(DOM.userCredentials.errors.password);
    isError = true;
  }
  if (email && !email.includes("@gmail.com")) {
    DOM.userCredentials.errors.email.textContent = "Enter a valid email";
    showElement(DOM.userCredentials.errors.email);
    isError = true;
  }
  if (password !== confirmPassword) {
    DOM.userCredentials.errors.confirmPassword.textContent =
      "Passwords do not match";
    showElement(DOM.userCredentials.errors.confirmPassword);
    isError = true;
  }
  if (isError) return;
  DOM.userCredentials.nextBtn.disabled = true;
  DOM.userCredentials.previousBtn.disabled = true;
  await fadeOutEffectOpacity(DOM.userCredentials.btnText);
  fadeInEffect(DOM.userCredentials.btnLoader);
  const q = query(ref(db, "userData"), orderByChild("email"), equalTo(email));
  await get(q)
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        DOM.userCredentials.errors.email.textContent = "Email already exists";
        showElement(DOM.userCredentials.errors.email);
        isError = true;
      }
    })
    .catch((error) => {
      showErrorSection("Error checking email:", error);
    });

  if (isError) {
    await fadeOutEffect(DOM.userCredentials.btnLoader);
    fadeInEffectOpacity(DOM.userCredentials.btnText);
    DOM.userCredentials.nextBtn.disabled = false;
    DOM.userCredentials.previousBtn.disabled = false;
    return;
  } else {
    await fadeOutEffect(DOM.userCredentials.btnLoader);
    await fadeInEffectOpacity(DOM.userCredentials.btnText);
    userObj.email = email;
    await fadeOutEffect(DOM.userCredentials.section);
    fadeInEffect(DOM.pfpSelection.section);
  }
  DOM.userCredentials.nextBtn.disabled = false;
  DOM.userCredentials.previousBtn.disabled = false;
});
//pfp selection listeners
DOM.pfpSelection.femaleToggleBtn.addEventListener("click", async () => {
  DOM.pfpSelection.femaleToggleBtn.classList.add("bg-surface-3");
  DOM.pfpSelection.maleToggleBtn.classList.remove("bg-surface-3");
  if (
    DOM.pfpSelection.pfpArr.female[0].classList.contains("hidden") &&
    DOM.pfpSelection.pfpContainer.scrollTop === 0
  ) {
    await fadeOutEffectOpacity(DOM.pfpSelection.pfpContainer);
    DOM.pfpSelection.pfpArr.male.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    DOM.pfpSelection.pfpArr.female.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    await fadeInEffectOpacity(DOM.pfpSelection.pfpContainer);
  } else if (
    DOM.pfpSelection.pfpArr.female[0].classList.contains("hidden") &&
    DOM.pfpSelection.pfpContainer.scrollTop > 0
  ) {
    DOM.pfpSelection.pfpArr.male.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    DOM.pfpSelection.pfpArr.female.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    DOM.pfpSelection.pfpContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});
DOM.pfpSelection.maleToggleBtn.addEventListener("click", async () => {
  DOM.pfpSelection.maleToggleBtn.classList.add("bg-surface-3");
  DOM.pfpSelection.femaleToggleBtn.classList.remove("bg-surface-3");
  if (
    DOM.pfpSelection.pfpArr.male[0].classList.contains("hidden") &&
    DOM.pfpSelection.pfpContainer.scrollTop === 0
  ) {
    await fadeOutEffectOpacity(DOM.pfpSelection.pfpContainer);
    DOM.pfpSelection.pfpArr.male.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    DOM.pfpSelection.pfpArr.female.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    await fadeInEffectOpacity(DOM.pfpSelection.pfpContainer);
  } else if (
    DOM.pfpSelection.pfpArr.male[0].classList.contains("hidden") &&
    DOM.pfpSelection.pfpContainer.scrollTop > 0
  ) {
    DOM.pfpSelection.pfpArr.male.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    DOM.pfpSelection.pfpArr.female.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    DOM.pfpSelection.pfpContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});
DOM.pfpSelection.pfpContainer.addEventListener("click", async (e) => {
  const target = e.target;
  if (target.classList.contains("pfp")) {
    await fadeOutEffectOpacity(DOM.pfpSelection.selectedPfpWrapper);
    DOM.pfpSelection.selectedPfp.src = target.getAttribute("src");
    await fadeInEffectOpacity(DOM.pfpSelection.selectedPfpWrapper);
  }
});
DOM.pfpSelection.previousBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.pfpSelection.section);
  fadeInEffect(DOM.userCredentials.section);
});
DOM.pfpSelection.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  userObj.pfpLink = DOM.pfpSelection.selectedPfp.src;
  await fadeOutEffect(DOM.pfpSelection.section);
  initSummaryForm();
  fadeInEffect(DOM.summaryForm.section);
});
function renderPfpWrapper() {
  renderImage("malePfp", malePfpLinks);
  renderImage("femalePfp", femalePfpLinks);
  renderImage("commonfp", commonPfpLinks);
}
function renderImage(className, link) {
  link.forEach((element) => {
    const pfp = document.createElement("img");
    pfp.src = element;
    // pfp.loading = "lazy";
    pfp.classList.add(
      "h-full",
      "w-full",
      "pfp",
      "cursor-pointer",
      `${className}`,
    );
    if (className === "malePfp") DOM.pfpSelection.pfpArr.male.push(pfp);
    if (className === "femalePfp") {
      pfp.classList.add("hidden");
      DOM.pfpSelection.pfpArr.female.push(pfp);
    }
    if (
      className === "commonfp" ||
      className === "memePfp" ||
      className === "cartoonPfp"
    )
      DOM.pfpSelection.pfpArr.common.push(pfp);
    DOM.pfpSelection.pfpContainer.appendChild(pfp);
  });
}
renderPfpWrapper();
//summary form functions and listeners
function initSummaryForm() {
  const userFullName = `${
    userObj.firstName.charAt(0).toUpperCase() + userObj.firstName.slice(1)
  } ${userObj.lastName.charAt(0).toUpperCase() + userObj.lastName.slice(1)}`;
  DOM.summaryForm.details.name.textContent = userFullName;
  DOM.summaryForm.details.pfp.src = userObj.pfpLink;
  DOM.summaryForm.details.rollNo.textContent = userObj.rollNumber;
  DOM.summaryForm.details.email.textContent = userObj.email;
  DOM.summaryForm.details.semester.textContent = userObj.semester;
  DOM.summaryForm.details.division.textContent = userObj.division;
}
DOM.summaryForm.previousBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.summaryForm.section);
  fadeInEffect(DOM.pfpSelection.section);
});
DOM.summaryForm.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  DOM.summaryForm.nextBtn.disabled = true;
  DOM.summaryForm.previousBtn.disabled = true;
  await fadeOutEffectOpacity(DOM.summaryForm.btnText);
  fadeInEffect(DOM.summaryForm.btnLoader);
  try {
    isNewUser.flag = true;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userObj.email,
      DOM.userCredentials.inputs.password.value,
    );
    const user = userCredential.user;
    userObj.userId = user.uid;
    await writeUserData();
    try {
      await signOut(auth);
      trackSignup(userObj.email);
      await fadeOutEffect(DOM.summaryForm.btnLoader);
      await fadeInEffectOpacity(DOM.summaryForm.btnText);
      await fadeOutEffect(DOM.summaryForm.section);
      await fadeInEffect(DOM.successScreen);
      DOM.successLottiePlayer.play();
    } catch (error) {
      showErrorSection("Error creating user:", error);
      await fadeOutEffect(DOM.summaryForm.section);
    }
  } catch (error) {
    showErrorSection("Error creating user:", error);
  }
  DOM.summaryForm.nextBtn.disabled = false;
  DOM.summaryForm.previousBtn.disabled = false;
});
async function writeUserData() {
  if (userObj.role === "teacher") {
    userObj.class = null;
  } else {
    userObj.class = `${userObj.semester}${userObj.division}`;
  }
  userObj.semester = null;
  userObj.division = null;
  const path = ref(db, `userData/${userObj.userId}`);
  return await set(path, userObj)
    .then(() => {})
    .catch((error) => {
      showErrorSection("Error writing user data:", error);
    });
}
// success screen lottie player
DOM.successLottiePlayer.addEventListener("complete", async () => {
  DOM.successWrapper.style.gap = "8px";
  await setTimeout(() => {
    DOM.successText.classList.add("show");
  }, 100);
  await setTimeout(() => {
    fadeOutEffect(DOM.successScreen);
  }, 1000);
  isNewUser.flag = false;
  setTimeout(() => {
    showLoginSection();
  }, 1500);
});
