/* Compat build pinned to the firebase version in package.json — keep them in lockstep. */
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');

/* Keep in sync with providePushNotifications() in src/app/app.config.ts. */
firebase.initializeApp({
  apiKey: 'AIzaSyCRR2ROcaF0iIqEopsQ8ifeGZFylse_Lrc',
  authDomain: 'zen-boreas.firebaseapp.com',
  projectId: 'zen-boreas',
  storageBucket: 'zen-boreas.firebasestorage.app',
  messagingSenderId: '407388055368',
  appId: '1:407388055368:web:662aa7e373bd8d57d6357d',
});

/* Instantiation alone wires background display and notification-click handling. */
firebase.messaging();
