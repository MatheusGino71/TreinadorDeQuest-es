// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWW6bAR8aUqz4g8ECyl9v0gusyS0ys6gE",
  authDomain: "treinador-de-questoes.firebaseapp.com",
  projectId: "treinador-de-questoes",
  storageBucket: "treinador-de-questoes.firebasestorage.app",
  messagingSenderId: "750836156866",
  appId: "1:750836156866:web:98926dbb2cc9e8c9ed6e5b",
  measurementId: "G-B4194749ZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (only the ones we need)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only when explicitly needed (avoid automatic initialization)
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    import("firebase/analytics").then(({ getAnalytics }) => {
      return getAnalytics(app);
    }).catch(console.warn);
  }
};

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines if you want to use Firebase emulators in development
  // Note: Make sure emulators are running before enabling these
  // connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

// Export the app instance
export default app;

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  try {
    return !!(app && auth && db && storage);
  } catch (error) {
    console.error('Firebase initialization check failed:', error);
    return false;
  }
};
