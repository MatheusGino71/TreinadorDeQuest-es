// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBx0S4HdJ7rwcbtVLNHEbzv3xXxbQwLugY",
  authDomain: "gameoab-a751b.firebaseapp.com",
  projectId: "gameoab-a751b",
  storageBucket: "gameoab-a751b.firebasestorage.app",
  messagingSenderId: "862369578361",
  appId: "1:862369578361:web:bf40f0b0ea69e80e3f83a8",
  measurementId: "G-KC9T8JSY6Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
let analytics: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics not available:', error);
}

try {
  auth = getAuth(app);
} catch (error) {
  console.error('Auth initialization failed:', error);
}

try {
  db = getFirestore(app);
} catch (error) {
  console.error('Firestore initialization failed:', error);
}

try {
  storage = getStorage(app);
} catch (error) {
  console.error('Storage initialization failed:', error);
}

export { analytics, auth, db, storage };

export default app;