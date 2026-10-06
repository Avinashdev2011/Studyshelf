import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  sendPasswordResetEmail,
  browserLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  onValue,
  update,
  equalTo,
  remove,
  push,
  query,
  orderByChild,
} from "firebase/database";
import { getToken, onMessage, getMessaging } from "firebase/messaging";

import { getAnalytics, logEvent, setUserId } from "firebase/analytics";
import { showErrorSection } from "./error";
import { resetForm } from "./login";
import { trackUserLogout } from "./posthog";
import { setOnMessageListener } from "./notification";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAuR2pQgW279Pg2Vrpg9GaOjRMdroICiz8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studyshelf-5f944.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://studyshelf-5f944-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studyshelf-5f944",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studyshelf-5f944.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "421579624636",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:421579624636:web:667667b856291a7e6b40b9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VYWK8060YC",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const messaging = getMessaging();
setOnMessageListener();
// firebase functions
export function deleteData(path) {
  return remove(ref(db, path))
    .then(() => {
      console.log("Data deleted successfully.");
    })
    .catch((error) => {
      showErrorSection("Error deleting data:", error);
      return;
    });
}
export function pushData(path, data) {
  return push(ref(db, path), data)
    .then(() => {
      console.log("Data pushed successfully.");
    })
    .catch((error) => {
      showErrorSection("Error pushing data:", error);
      return;
    });
}
export function updateData(path, data) {
  return update(ref(db, path), data)
    .then(() => {
      console.log("Data updated successfully.");
    })
    .catch((error) => {
      showErrorSection("Error updating data:", error);
      return;
    });
}
export function writeData(path, data) {
  return set(ref(db, path), data)
    .then(() => {
      console.log("Data written successfully.");
    })
    .catch((error) => {
      showErrorSection("Error writing data:", error);
      return;
    });
}
export async function signOutUser() {
  try {
    if (auth.currentUser?.email) {
      trackUserLogout(auth.currentUser.email);
    }
  } catch (err) {
    console.warn("Error tracking logout:", err);
  }
  return signOut(auth)
    .then(() => {
      resetForm();
    })
    .catch((error) => {
      showErrorSection("Error signing out:", error);
    });
}
export {
  app,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  auth,
  db,
  ref,
  set,
  get,
  push,
  onValue,
  equalTo,
  update,
  remove,
  query,
  inMemoryPersistence,
  browserLocalPersistence,
  getDatabase,
  orderByChild,
  child,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  setUserId,
  analytics,
  logEvent,
  getMessaging,
  messaging,
  getToken,
  onMessage,
};
