import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

/**
 * Firebase web config is public by design (it identifies the project, it does
 * not authorise anything), so the literals double as fallbacks: a build made
 * without the env file still gets working push instead of failing silently.
 * Must stay in sync with public/firebase-messaging-sw.js.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAuajcC5Bf6jn-B_BcQtKOzak63dpajzyM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "khadam-f693b.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://khadam-f693b-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "khadam-f693b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "khadam-f693b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1080039978592",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1080039978592:web:7a4afa17072ed68f63b505",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4S1NWD12QF"
};

/** Public VAPID key for web push — same reasoning as the config above. */
const VAPID_KEY_FALLBACK =
  "BA83dI_moRNXLuAV8nZxJHiFDaLq169f6F1fcOAhT4JXVzD2b3M7Z56LcYTvi8_Rl0N6muIuveWx8W_0Pacm1aY";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics. Guarded because getAnalytics throws in browsers with
// storage disabled — an uncaught throw here would take messaging down with it.
export const analytics = (() => {
  if (typeof window === 'undefined') return null;
  try {
    return getAnalytics(app);
  } catch (error) {
    console.warn("Firebase Analytics unavailable", error);
    return null;
  }
})();

// Initialize Messaging
export let messaging: Messaging;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase Messaging not supported", error);
}

export const requestForToken = async (serviceWorkerRegistration?: ServiceWorkerRegistration) => {
  if (!messaging) return null;
  
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || VAPID_KEY_FALLBACK,
      serviceWorkerRegistration
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, callback);
};
