// Import Firebase core
import { initializeApp } from "firebase/app";

// Optional: Only if you want analytics
import { getAnalytics } from "firebase/analytics";

// ✅ Import Firestore
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBfYv5LGOnUEjwePWNi0Q1yvA6bsV2gEYM",
  authDomain: "noob-da13c.firebaseapp.com",
  projectId: "noob-da13c",
  storageBucket: "noob-da13c.appspot.com", // ⚠️ Fixed typo here
  messagingSenderId: "565675899485",
  appId: "1:565675899485:web:64daf67e71e0e1453b2bb4",
  measurementId: "G-FD279NV0L5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional

// ✅ Add Firestore initialization and export
export const db = getFirestore(app);
