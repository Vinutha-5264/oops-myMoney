// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let analytics; // Don't export unless needed
let app = initializeApp({
  apiKey: 'AIzaSyBfYv5LGOnUEjwePWNi0Q1yvA6bsV2gEYM',
  authDomain: 'noob-da13c.firebaseapp.com',
  projectId: 'noob-da13c',
  storageBucket: 'noob-da13c.appspot.com',
  messagingSenderId: '565675899485',
  appId: '1:565675899485:web:64daf67e71e0e1453b2bb4',
  measurementId: 'G-FD279NV0L5',
});

const db = getFirestore(app);

// ✅ Only call analytics if window is available
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { db };
