import { fadeInEffect, fadeOutEffect } from "./animation";
import {
  getToken,
  onMessage,
  app,
  getMessaging,
  messaging,
  update,
  set,
} from "./firebase.js";
import { appState } from "./appstate";
import { isSubscribe } from "./login.js";
import { trackAllowNotification } from "./posthog.js";
import { BACKEND_URL } from "./driveApi.js";
const DOM = {
  allowNotification: {
    popup: document.querySelector(".allow-notification-popup-wrapper"),
    successBtn: document.querySelector(
      ".allow-notification-popup-wrapper .success-btn",
    ),
    closeBtn: document.querySelector(
      ".allow-notification-popup-wrapper .close-popup-btn",
    ),
  },
  allowInSettings: {
    popup: document.querySelector(".allow-notification-settings-popup-wrapper"),
    successBtn: document.querySelector(
      ".allow-notification-settings-popup-wrapper .success-btn",
    ),
    closeBtn: document.querySelector(
      ".allow-notification-settings-popup-wrapper .close-popup-btn",
    ),
  },
  updates: {
    popup: document.querySelector(".updates-popup-wrapper"),
    successBtn: document.querySelector(".updates-popup-wrapper .success-btn"),
    cardContainer: document.querySelector(
      ".updates-popup-wrapper .card-container",
    ),
  },
};

let token;
let subscribedTopics = [];
export async function requestNotificationPermission() {
  if (Notification.permission === "granted") {
    token = await getToken(messaging, {
      vapidKey:
        "BP2FM9upp84r_zB6MSRn4OWOgiUt5qUzjEP0z863cBbQF7O7OypOL3Cc-rwcb6QVpqbpSC5L67tfoUn3jg7jlyQ",
    });
    subscribe();
  } else {
    fadeInEffect(DOM.allowNotification.popup);
  }
}
DOM.allowNotification.successBtn.addEventListener("click", async () => {
  await Notification.requestPermission().then(async (permission) => {
    if (permission === "granted") {
      fadeOutEffect(DOM.allowNotification.popup);
      token = await getToken(messaging, {
        vapidKey:
          "BP2FM9upp84r_zB6MSRn4OWOgiUt5qUzjEP0z863cBbQF7O7OypOL3Cc-rwcb6QVpqbpSC5L67tfoUn3jg7jlyQ",
      });
      trackAllowNotification("User allowed notifications");
      isSubscribe.subscribe = true;

      subscribe(token);
      return;
    }
  });
  if (Notification.permission === "denied") {
    fadeInEffect(DOM.allowInSettings.popup);
  }
});
DOM.allowNotification.closeBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.allowNotification.popup);
});
DOM.allowInSettings.closeBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.allowInSettings.popup);
});
export function setOnMessageListener() {
  onMessage(messaging, (payload) => {
    if (Notification.permission === "granted") {
      const { title, body } = payload.data;
      showToast(title, body);
    }
  });
}
function showToast(title, body) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className =
    "toaster bg-surface-2 border-surface-3 custom-hover flex items-center justify-center gap-4 rounded-2xl border p-4 px-6 lg:gap-5 cursor-pointer w-full lg:w-fit pointer-events-auto lg:max-w-[30rem]";
  toast.style.cssText = `
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  toast.innerHTML = `
    <i class="fa-solid fa-bell text-text-secondary text-xl"></i>
    <div class="wrapper flex flex-col gap-0.5">
      <p class="title text-sm font-semibold">${title}</p>
      <p class="body text-text-secondary text-sm line-clamp-4">${body}</p>
      <p class=" text-text-tertiary text-xs">Reload to see new updates</p>

    </div>
  `;
  container.prepend(toast);
  const height = toast.offsetHeight + 8;
  const others = container.querySelectorAll(".toaster:not(:first-child)");
  others.forEach((el) => {
    el.style.transition = "none";
    el.style.transform = `translateY(-${height}px)`;
    el.offsetHeight;
    el.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  });
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
    others.forEach((el) => {
      el.style.transform = "translateY(0)";
    });
  });
  toast.addEventListener("touchstart", () => hideToast(toast));
  toast.addEventListener("click", () => hideToast(toast));
  setTimeout(() => hideToast(toast), 5000);
}
function hideToast(toast) {
  const height = toast.offsetHeight + 8; // spacing
  const container = document.getElementById("toast-container");
  const allToasts = Array.from(container.querySelectorAll(".toaster"));
  const index = allToasts.indexOf(toast);
  const below = allToasts.slice(index + 1);

  toast.style.transform = "translateX(100%)";
  toast.style.opacity = "0";

  below.forEach((el) => {
    el.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.transform = `translateY(-${height}px)`;
  });

  setTimeout(() => {
    toast.remove();

    below.forEach((el) => {
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
      el.offsetHeight;
      el.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    });
  }, 300);
}
export async function sendNotification(title, message, scope) {
  scope = String(scope);
  let topics = [];
  if (scope === "global") {
    topics.push("global");
  } else if (scope === "semester") {
    const sem = appState.activeSem;
    topics.push(`semester${sem}`);
  } else if (scope === "division") {
    const sem = appState.activeSem;
    const div = appState.activeDiv;
    topics.push(`${sem}${div}`);
  }
  await fetch(`${BACKEND_URL}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topics: topics,
      title: title,
      body: message,
    }),
  });
}
async function getNotifications() {
  return new Promise((resolve) => {
    const request = indexedDB.open("notificationDB");
    request.onsuccess = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("notifications")) {
        resolve([]);
        return;
      }

      const tx = db.transaction("notifications", "readonly");
      const store = tx.objectStore("notifications");

      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => resolve(getAllReq.result);
      getAllReq.onerror = () => resolve([]);
    };

    request.onerror = () => resolve([]);
  });
}
async function clearNotifications() {
  return new Promise((resolve) => {
    const request = indexedDB.open("notificationDB");

    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("notifications")) return resolve();

      const tx = db.transaction("notifications", "readwrite");
      const store = tx.objectStore("notifications");

      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        console.log("Notifications cleared from IndexedDB.");
        resolve();
      };
      clearReq.onerror = () => resolve();
    };

    request.onerror = () => resolve();
  });
}
export async function showStoredNotification() {
  await FcmTopicMigrate();
  const notifications = await getNotifications();
  if (!notifications || notifications.length === 0) return;
  console.log("Retrieved notifications:", notifications);

  notifications.forEach((n) => {
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 border-surface-3 custom-hover flex cursor-pointer flex-col items-start justify-between rounded-xl border p-3 md:px-4";
    card.innerHTML = `
      <p class="title font-semibold">${n.data.title}</p>
      <p class="description text-text-secondary line-clamp-3">${n.data.body}</p>
    `;
    DOM.updates.cardContainer.appendChild(card);
  });

  // Apply fade-in effect
  await fadeInEffect(DOM.updates.popup);

  // Clear notifications safely after displaying
  await clearNotifications();
}
DOM.updates.successBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.updates.popup);
});
window.addEventListener("beforeunload", () => {
  if (
    localStorage.getItem("rememberMe") === null &&
    token &&
    subscribedTopics.length > 0
  ) {
    const payload = {
      token,
      topics: subscribedTopics,
    };
    navigator.sendBeacon(
      `${BACKEND_URL}/unsubscribe`,
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
  }
});

export function unsubscribeFCM() {
  if (
    localStorage.getItem("rememberMe") === null &&
    token &&
    subscribedTopics.length > 0
  ) {
    console.log("Unsubscribing from FCM");

    const payload = {
      token,
      topics: subscribedTopics,
    };
    navigator.sendBeacon(
      `${BACKEND_URL}/unsubscribe`,
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
  }
}

export async function subscribe() {
  if (!token) {
    token = await getToken(messaging, {
      vapidKey:
        "BP2FM9upp84r_zB6MSRn4OWOgiUt5qUzjEP0z863cBbQF7O7OypOL3Cc-rwcb6QVpqbpSC5L67tfoUn3jg7jlyQ",
    });
  }
  let userRole = appState.userData.role;
  let topicArr = [];
  let semesterSet = new Set();
  if (userRole === "student" || userRole === "editor") {
    topicArr.push(
      appState.userData.class,
      `semester${appState.activeSem}`,
      "global",
    );
  } else if (userRole === "teacher") {
    for (const key in appState.userData.assignedClasses) {
      const semester = key[0];
      semesterSet.add(`semester${semester}`);
    }
    topicArr.push(...Array.from(semesterSet));
    for (const key in appState.userData.assignedClasses) {
      topicArr.push(key);
    }
    topicArr.push("global");
  } else if (userRole === "admin") {
    topicArr.push(
      "1A",
      "1B",
      "2A",
      "2B",
      "3A",
      "3B",
      "4A",
      "4B",
      "5A",
      "5B",
      "6A",
      "6B",
      "global",
      "semester1",
      "semester2",
      "semester3",
      "semester4",
      "semester5",
      "semester6",
    );
  }
  subscribedTopics = topicArr;
  if (isSubscribe.subscribe) {
    await fetch(`${BACKEND_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token.trim(),
        topics: topicArr,
      }),
    }).then(() => {
      isSubscribe.subscribe = false;
    });
  }
}

export async function FcmTopicMigrate() {
  const hasMigrated = localStorage.getItem("fcmTopicMigrated");

  if (!token) {
    token = await getToken(messaging, {
      vapidKey:
        "BP2FM9upp84r_zB6MSRn4OWOgiUt5qUzjEP0z863cBbQF7O7OypOL3Cc-rwcb6QVpqbpSC5L67tfoUn3jg7jlyQ",
    });
  }

  const userRole = appState.userData.role;
  const userClass = appState.userData.class;

  if (userRole !== "student" && userRole !== "editor") {
    console.log("Not a student/editor, no migration needed");
    return;
  }

  let oldTopics = [];
  let newTopics = [];

  if (userClass === "6A") {
    oldTopics = ["5A", "semester5"];
    newTopics = ["6A", "semester6"];
  } else if (userClass === "6B") {
    oldTopics = ["5B", "semester5"];
    newTopics = ["6B", "semester6"];
  } else {
    return;
  }
  if (hasMigrated === "true") {
    console.log("FCM topic migration already done");
    return;
  }

  try {
    await fetch(`${BACKEND_URL}/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token.trim(),
        topics: oldTopics,
      }),
    });

    await fetch(`${BACKEND_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token.trim(),
        topics: newTopics,
      }),
    });

    subscribedTopics = subscribedTopics.filter(
      (topic) => !oldTopics.includes(topic),
    );
    subscribedTopics.push(...newTopics);
    console.log(subscribedTopics);
    console.log("FCM topic migration completed successfully");
    localStorage.setItem("fcmTopicMigrated", "true");
  } catch (error) {
    console.error("FCM topic migration failed:", error);
  }
}
