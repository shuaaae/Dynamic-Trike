// Firebase v9+ modular imports - Updated
import { initializeApp } from 'firebase/app';

// Import Firebase Auth with fallback
let getAuth: any;
let initializeAuth: any;
let getReactNativePersistence: any;
try {
  const authModule = require('firebase/auth');
  getAuth = authModule.getAuth;
  initializeAuth = authModule.initializeAuth;
  getReactNativePersistence = authModule.getReactNativePersistence;
} catch (error) {
  console.log('Firebase auth import failed, using fallback');
  getAuth = () => ({});
  initializeAuth = () => ({});
  getReactNativePersistence = () => ({});
}

// Import Firestore with fallback
let getFirestore: any;
try {
  const firestoreModule = require('firebase/firestore');
  getFirestore = firestoreModule.getFirestore;
} catch (error) {
  console.log('Firebase firestore import failed, using fallback');
  getFirestore = () => ({});
}

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

// Initialize Firebase Auth with AsyncStorage persistence
let auth: any;
try {
  const ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  console.log('[Firebase] Auth initialized with AsyncStorage persistence');
  console.log('[Firebase] Auth persistence enabled - auth state will persist between sessions');
} catch (error) {
  console.log('[Firebase] Failed to initialize auth with persistence, using default:', error);
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
