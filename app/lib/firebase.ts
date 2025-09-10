import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATY-OYHAxrq3iFvFbCihbGndLbxYX7jsc",
  authDomain: "dynamic-trike-137dc.firebaseapp.com",
  projectId: "dynamic-trike-137dc",
  storageBucket: "dynamic-trike-137dc.firebasestorage.app",
  messagingSenderId: "981045059020",
  appId: "1:981045059020:web:2548052a614fd193211169",
  measurementId: "G-7PFCZDFY2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (persistence is handled automatically in React Native)
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
