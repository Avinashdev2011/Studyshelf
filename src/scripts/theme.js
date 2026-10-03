import { themeOptions } from "./theme-options.js";
import { animationData } from "./lottieLoader.js";
import { fadeInEffect, fadeOutEffect } from "./animation";
import lottie from "lottie-web";
import { updateData, writeData } from "./firebase.js";
import { appState } from "./appstate.js";
import { themedAnimations, getThemeAnimation } from "./themed-animations.js";
import { trackThemeChange } from "./posthog.js";
const DOM = {
  popup: document.querySelector(".theme-popup-wrapper"),
  closeBtn: document.querySelector(".theme-popup-wrapper .close-popup-btn"),
  successBtn: document.querySelector(".theme-popup-wrapper .success-btn"),
  themeOptionContainer: document.querySelector(
    ".theme-popup-wrapper .theme-option-container",
  ),
  loaderContainer: document.querySelector(
    ".lottie-loading-screen .loading-wrapper",
  ),
  themeBtn: document.querySelector(".theme-btn"),
  smThemeBtn: document.querySelector(".sm-theme-btn"),
  updatePopup: {
    popup: document.querySelector(".theme-feature-update-popup-wrapper"),
    successBtn: document.querySelector(
      ".theme-feature-update-popup-wrapper .success-btn",
    ),
  },
};
let activeTheme = localStorage.getItem("activeTheme") || "default";
let activeThemeDiv = null;
let tempSelectedTheme = "default";
let tempSelectedThemeDiv = null;
let isLoaderAnimation = null;

document.addEventListener("DOMContentLoaded", () => {
  setCssProperties(activeTheme);
});
export function loadThemeOptions() {
  if (document.querySelector(".themeClick")) {
    document.querySelector(".themeClick").classList.remove("themeClick");
  }
  for (const [key, value] of Object.entries(themeOptions)) {
    const div = document.createElement("div");
    div.className =
      "theme-" +
      key +
      " hover:bg-surface-3 flex w-full items-center justify-between rounded-md px-3 py-1 transition-colors duration-200 hover:cursor-pointer";
    div.innerHTML = `
  ${value.name}
  <div class="swatch flex w-fit">
    <div class="color1 h-5 w-5 rounded-tl-sm rounded-bl-sm"></div>
    <div class="color2 h-5 w-5"></div>
    <div class="color3 h-5 w-5"></div>
    <div class="color4 h-5 w-5 rounded-tr-sm rounded-br-sm"></div>
  </div>
`;

    const color1 = div.querySelector(".color1");
    const color2 = div.querySelector(".color2");
    const color3 = div.querySelector(".color3");
    const color4 = div.querySelector(".color4");
    color4.style.backgroundColor = value.textPrimary;
    color3.style.backgroundColor = value.primary;
    color2.style.backgroundColor = value.surface3;
    color1.style.backgroundColor = value.surface1;

    if (key === activeTheme) {
      div.classList.add("themeClick");
      activeThemeDiv = div;
      tempSelectedThemeDiv = div;
    }

    div.addEventListener("click", () => {
      setCssProperties(key);
      tempSelectedThemeDiv.classList.remove("themeClick");
      tempSelectedTheme = key;
      tempSelectedThemeDiv = div;
      div.classList.add("themeClick");
    });

    DOM.themeOptionContainer.appendChild(div);
  }
}
export function initTheme(theme) {
  activeTheme = theme || "default";
  setCssProperties(activeTheme);
  setThemeToLocalStorage(activeTheme);
  setLoaderProperties();
}

// set theme functions
function setCssProperties(inputTheme) {
  const theme = themeOptions[inputTheme];

  document.documentElement.style.setProperty("--color-primary", theme.primary);
  document.documentElement.style.setProperty(
    "--color-primary-2",
    theme.primary2,
  );

  //   surface
  document.documentElement.style.setProperty(
    "--color-surface-1",
    theme.surface1,
  );
  document.documentElement.style.setProperty(
    "--color-surface-2",
    theme.surface2,
  );
  document.documentElement.style.setProperty(
    "--color-surface-3",
    theme.surface3,
  );
  document.documentElement.style.setProperty(
    "--color-surface-4",
    theme.surface4,
  );

  //   text
  document.documentElement.style.setProperty(
    "--color-text-primary",
    theme.textPrimary,
  );
  document.documentElement.style.setProperty(
    "--color-text-secondary",
    theme.textSecondary,
  );
  document.documentElement.style.setProperty(
    "--color-text-tertiary",
    theme.textTertiary,
  );
  document.documentElement.style.setProperty(
    "--color-text-link",
    theme.textLink,
  );
  document.documentElement.style.setProperty(
    "--color-on-primary",
    theme.onPrimary,
  );
  document.documentElement.style.setProperty(
    "--color-surface-70",
    `color-mix(in srgb, ${theme.surface1} 70%, transparent)`,
  );

  //navigation
  document.documentElement.style.setProperty("--color-nav-fill", theme.navFill);
  document.documentElement.style.setProperty(
    "--color-nav-glow",
    `${theme.navGlow}${theme.glowOpacity ? theme.glowOpacity : 20}`,
  );
  document.documentElement.style.setProperty(
    "--color-nav-border",
    theme.navBorder,
  );
  document.documentElement.style.setProperty("--color-on-nav", theme.onNav);
  document.documentElement.style.setProperty(
    "--color-nav-selector",
    theme.navSelector,
  );

  // extra tweaking for special themes
  const loader = document.querySelector(".loader");
  if (inputTheme === "shadowNoir" && loader) {
    loader.style.borderBottomColor = theme.textPrimary;
  } else if (loader) {
    loader.style.borderBottomColor = theme.primary;
  }
}
export function setLoaderProperties() {
  const animationData = getThemeAnimation(activeTheme);
  if (isLoaderAnimation) {
    isLoaderAnimation.destroy();
    isLoaderAnimation = null;
  }

  DOM.loaderContainer.replaceChildren();

  isLoaderAnimation = lottie.loadAnimation({
    container: DOM.loaderContainer,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: animationData, // Pre-themed, zero processing!
  });

  const div = document.createElement("div");
  div.innerHTML = `<p class="loading-text order-2 text-lg font-semibold">Loading...</p>`;
  DOM.loaderContainer.appendChild(div);
}

// theme writer functions
function setThemeToDb(theme) {
  updateData(`userData/${appState.userId}`, { theme: theme });
}
function setThemeToLocalStorage(theme) {
  localStorage.setItem("activeTheme", theme);
}

// theme popup open close
DOM.successBtn.addEventListener("click", () => {
  setCssProperties(tempSelectedTheme);
  activeTheme = tempSelectedTheme;
  activeThemeDiv = tempSelectedThemeDiv;
  fadeOutEffect(DOM.popup);
  setThemeToLocalStorage(activeTheme);
  setThemeToDb(activeTheme);
  trackThemeChange(activeTheme, appState.activeSem, appState.activeDiv);
});
DOM.smThemeBtn.addEventListener("click", () => {
  fadeInEffect(DOM.popup);
});
DOM.closeBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.popup);
  setCssProperties(activeTheme);
  tempSelectedThemeDiv.classList.remove("themeClick");
  activeThemeDiv.classList.add("themeClick");
  tempSelectedTheme = activeTheme;
  tempSelectedThemeDiv = activeThemeDiv;
  activeThemeDiv = null;
  fadeOutEffect(DOM.popup);
});
document.addEventListener("click", (e) => {
  if (DOM.popup.classList.contains("hidden") && e.target === DOM.themeBtn) {
    fadeInEffect(DOM.popup);
  }
});
