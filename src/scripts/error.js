import { fadeInEffect, fadeOutEffect } from "./animation";
import { hideSections, hideSectionLoader, lottieLoadingScreen } from "./index";
const DOM = {
  offline: {
    section: document.querySelector(".offline-section"),
    img: document.querySelector(".offline-section img"),
  },
};
const errorSection = document.querySelector(".error-section");
import * as Sentry from "@sentry/browser";
Sentry.init({
  dsn: "https://f123aee0ee34252e12f97d64f9127ba3@o4509854772297728.ingest.us.sentry.io/4509854774394880",
  sendDefaultPii: true,
});
export async function showErrorSection(errorMsg, error) {
  await hideSections(false, false, false, false);
  await hideSectionLoader();
  await fadeOutEffect(lottieLoadingScreen);
  await fadeInEffect(errorSection);
  Sentry.captureException(error);
  console.error(errorMsg, error);
}
export async function isOffline() {
  if (!navigator.onLine) {
    fadeInEffect(DOM.offline.section);
    await new Promise((resolve) => setTimeout(resolve, 60000));
    window.location.reload();
    return;
  } else {
    fadeOutEffect(DOM.offline.section);
    return;
  }
}
export async function sentaryInit(email, userName) {
  Sentry.setUser({ userName: userName, email: email });
}
const offlineImgCache = new Image();
offlineImgCache.src = "/error-images/offline.png";
offlineImgCache.onload = () => {
  DOM.offline.img.src = offlineImgCache.src;
};
