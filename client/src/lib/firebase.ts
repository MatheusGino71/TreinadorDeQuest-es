// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVP5TvjhAXsYKaOFNYEyJ9TNcoxMT5pxE",
  authDomain: "gameoab-45225.firebaseapp.com",
  projectId: "gameoab-45225",
  storageBucket: "gameoab-45225.firebasestorage.app",
  messagingSenderId: "1034952648172",
  appId: "1:1034952648172:web:65755af9e63aa14b484cc9",
  measurementId: "G-ZZ08WM6728"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;