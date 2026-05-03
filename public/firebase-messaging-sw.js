// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyAuajcC5Bf6jn-B_BcQtKOzak63dpajzyM",
  authDomain: "khadam-f693b.firebaseapp.com",
  projectId: "khadam-f693b",
  storageBucket: "khadam-f693b.firebasestorage.app",
  messagingSenderId: "1080039978592",
  appId: "1:1080039978592:web:7a4afa17072ed68f63b505",
  measurementId: "G-4S1NWD12QF"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
