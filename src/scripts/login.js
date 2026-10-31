// loginform var and listner
import { hideSections, showSectionLoader } from "./index.js";
import {
  fadeInEffect,
  fadeOutEffect,
  fadeOutEffectOpacity,
  fadeInEffectOpacity,
  hideElement,
} from "./animation.js";
import {
  signInWithEmailAndPassword,
  auth,
  inMemoryPersistence,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
} from "./firebase.js";
import { isOffline } from "./error.js";
// login var function and listner
export const loginSection = document.querySelector(".login-section");
const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const emailRelatedError = document.querySelector("#email-related-error");
const passwordRelatedError = document.querySelector("#password-related-error");
const loginFormRelatedError = document.querySelector("#form-related-error");
const keepLoginCheckBox = document.querySelector("#keep-login-check");
const forgotPasswordLink = document.querySelector("#forgot-password-link");
const loginBtn = document.querySelector(".login-btn");
const loginBtnLoader = loginBtn.querySelector(".btn-loader");
const loginBtnText = loginBtn.querySelector(".text");

export const isSubscribe = {
  subscribe: false,
};
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await isOffline();
  emailRelatedError.textContent = "";
  passwordRelatedError.textContent = "";
  loginFormRelatedError.textContent = "";
  if (keepLoginCheckBox.checked) {
    localStorage.setItem("rememberMe", "true");
  }
  const persistenceType = keepLoginCheckBox.checked
    ? browserLocalPersistence
    : inMemoryPersistence;
  if (emailInput.value.trim() === "" || passwordInput.value.trim() === "") {
    if (emailInput.value.trim() === "") {
      emailRelatedError.textContent = "Email required";
    }
    if (passwordInput.value.trim() === "") {
      passwordRelatedError.textContent = "Password required";
    }
    return;
  }
  const email = emailInput.value;
  const password = passwordInput.value;
  toggleFormState(true);
  setPersistence(auth, persistenceType)
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then(async (userCredential) => {
      isSubscribe.subscribe = true;
      if (loginSection) {
        loginSection.classList.add("hidden");
        loginSection.style.display = "none";
      }
      showSectionLoader("Logging in...", false);
      history.pushState({}, "", "/");
    })
    .catch((error) => {
      if (error.code === "auth/invalid-credential") {
        toggleFormState(false);
        loginFormRelatedError.textContent = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        toggleFormState(false);
        loginFormRelatedError.textContent = "Too many attempts.";
      } else {
        toggleFormState(false);
        loginFormRelatedError.textContent = "Something went wrong.";
      }
    });
});
export function resetForm() {
  emailInput.value = "";
  passwordInput.value = "";
  keepLoginCheckBox.checked = false;
  if (emailRelatedError) emailRelatedError.textContent = "";
  if (passwordRelatedError) passwordRelatedError.textContent = "";
  if (loginFormRelatedError) loginFormRelatedError.textContent = "";
  toggleFormState(false);
}
forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  showResetPasswordSection();
});
export async function showLoginSection() {
  history.replaceState({}, "", "/?login=''");
  document.body.classList.remove("is-admin");

  // 1. Hide header and all its subcomponents
  const header = document.querySelector("header");
  if (header) hideElement(header);
  const headerIcon = document.querySelector(".header-icon");
  if (headerIcon) hideElement(headerIcon);
  const headerTitle = document.querySelector(".header-title");
  if (headerTitle) hideElement(headerTitle);
  const adminBtnWrapper = document.querySelector(".admin-btn-wrapper");
  if (adminBtnWrapper) hideElement(adminBtnWrapper);
  const adminReturnBtn = document.querySelector(".admin-return-btn");
  if (adminReturnBtn) hideElement(adminReturnBtn);

  // 2. Hide navigation / sidebar and remove main margin
  const sideBar = document.querySelector(".side-bar");
  if (sideBar) hideElement(sideBar);
  const main = document.querySelector("main");
  if (main) main.classList.remove("lg:ml-[4.375rem]");

  // 3. Hide all admin, division, and classroom views
  const adminSec = document.querySelector(".admin-section");
  if (adminSec) hideElement(adminSec);
  const divList = document.querySelector(".division-list");
  if (divList) hideElement(divList);
  const classRoom = document.querySelector(".class-room");
  if (classRoom) hideElement(classRoom);

  // 4. Hide all sections except loginSection
  const allSections = document.querySelectorAll("section");
  allSections.forEach((sec) => {
    if (sec !== loginSection) {
      hideElement(sec);
    }
  });

  // 5. Hide ALL popup wrappers, modals, overlays across the app
  const popups = document.querySelectorAll(
    `[class*="-popup-wrapper"], [class*="-popup"], .menu-popup-wrapper, .account-details-popup-wrapper, .pfp-selection-popup-wrapper, .select-class-popup-wrapper, .subject-selector-popup-wrapper, .pick-teacher-popup-wrapper, .add-user-link-popup-wrapper, .individual-user-popup-wrapper, .class-code-popup-wrapper, .theme-popup-wrapper, .time-table-popup-wrapper, .select-subject-folder-wrapper, .upload-file-popup-wrapper, .add-material-popup, .confirmation-popup-wrapper, .allow-notification-popup-wrapper, .allow-notification-settings-popup-wrapper, .updates-popup-wrapper, .edit-sem-div-popup-wrapper, .edit-medal-popup-wrapper, .add-division-popup-wrapper, .add-subject-popup-wrapper, .add-ebook-popup-wrapper, .lottie-loading-screen, .success-screen`
  );
  popups.forEach((p) => {
    if (p && !p.classList.contains("task-loader-wrapper")) {
      hideElement(p);
    }
  });

  // 6. Reset form inputs & errors
  resetForm();

  // 7. Reveal and animate login section
  if (loginSection) {
    loginSection.classList.remove("hidden");
    loginSection.style.display = "flex";
    loginSection.style.opacity = "0";
    await fadeInEffect(loginSection);
  }
}
export async function showResetPasswordSection() {
  history.pushState({}, "", "?resetPassword");
  await hideSections(false, false, false, false);
  await fadeInEffect(resetPasswordSection);
}
// reset password var , function and listner
const resetPasswordSection = document.querySelector(".reset-password-section");
const resetPasswordForm = document.querySelector("#reset-password-form");
const registeredEmailInput = document.querySelector("#registered-email-input");
const registeredEmailInputRelatedError = document.querySelector(
  "#registered-email-related-error",
);
const backToLoginPageBtn = document.querySelector(".back-to-login-btn");
const resetPasswordBtn = document.querySelector(".reset-password-btn");
const resetPasswordBtnLoader = resetPasswordBtn.querySelector(".btn-loader");
const resetPasswordBtnText = resetPasswordBtn.querySelector(".text");
backToLoginPageBtn.addEventListener("click", async () => {
  showLoginSection();
});
resetPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const registeredEmailValue = registeredEmailInput.value;
  registeredEmailInputRelatedError.textContent = "";
  if (registeredEmailValue.trim() === "") {
    registeredEmailInputRelatedError.textContent = "Email required";
    return;
  }
  toggleFormState(true);
  sendPasswordResetEmail(auth, registeredEmailValue)
    .then(() => {
      toggleFormState(false);
      registeredEmailInputRelatedError.textContent =
        "Reset link sent to your email.";
      registeredEmailInputRelatedError.classList.remove("text-text-error");
      registeredEmailInputRelatedError.classList.add("text-green-500");
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        registeredEmailInputRelatedError.textContent =
          "No user found with this email.";
      } else if (error.code === "auth/invalid-email") {
        registeredEmailInputRelatedError.textContent = "Invalid email address.";
      } else {
        registeredEmailInputRelatedError.textContent = "Something went wrong.";
      }
      registeredEmailInputRelatedError.classList.remove("text-green-500");
      registeredEmailInputRelatedError.classList.add("text-text-error");
    });
});
export async function toggleFormState(isDisabled) {
  emailInput.disabled = isDisabled;
  passwordInput.disabled = isDisabled;
  keepLoginCheckBox.disabled = isDisabled;
  loginBtn.disabled = isDisabled;
  resetPasswordBtn.disabled = isDisabled;
  registeredEmailInput.disabled = isDisabled;
  if (isDisabled) {
    await fadeOutEffectOpacity(resetPasswordBtnText);
    await fadeOutEffectOpacity(loginBtnText);
    await fadeInEffect(loginBtnLoader);
    await fadeInEffect(resetPasswordBtnLoader);
  } else {
    await fadeOutEffect(resetPasswordBtnLoader);
    await fadeOutEffect(loginBtnLoader);
    await fadeInEffectOpacity(resetPasswordBtnText);
    await fadeInEffectOpacity(loginBtnText);
  }
}
