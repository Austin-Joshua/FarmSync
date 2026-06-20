import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug log for configuration (Safe version)
if (import.meta.env.MODE === 'development') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value && key !== 'measurementId')
    .map(([key]) => key);
    
  if (missingKeys.length > 0) {
    console.error("Firebase Configuration Missing Keys:", missingKeys);
  } else {
    console.log("Firebase Configuration loaded for project:", firebaseConfig.projectId);
  }
}

let auth: any;
let db: any;
let messaging: any;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Safe messaging initialization (can fail on some browsers/environments)
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.warn("Firebase Messaging not supported/initialized:", e);
    messaging = null;
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db, messaging };
export default auth ? auth.app : null;
