export async function fadeInEffect(element) {
  if (!element.classList.contains("hidden")) {
    return;
  }
  element.style.opacity = "0";
  element.classList.remove("hidden");
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export async function fadeOutEffect(element) {
  if (element.classList.contains("hidden")) {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  if (durationStr === "0s") {
    element.classList.add("hidden");
    return;
  }
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
  element.classList.add("hidden");
}
export async function fadeInEffectOpacity(element) {
  if (element.style.opacity !== "0") {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export async function fadeOutEffectOpacity(element) {
  if (element.style.opacity === "0") {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export function hideElement(element) {
  element.classList.add("hidden");
}
export function showElement(element) {
  element.classList.remove("hidden");
  element.style.opacity = "1";
}
