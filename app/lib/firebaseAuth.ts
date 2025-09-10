import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebase';
import { AuthUser, RegisterCredentials } from '../types/database';

const AUTH_KEY = 'firebase_auth';
const USER_DATA_KEY = 'user_data';

// AsyncStorage helper functions
const saveUserToStorage = async (user: AuthUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    console.log('[Storage] User data saved to AsyncStorage');
  } catch (error) {
    console.error('[Storage] Failed to save user data:', error);
  }
};

const getUserFromStorage = async (): Promise<AuthUser | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('[Storage] User data restored from AsyncStorage');
      return user;
    }
  } catch (error) {
    console.error('[Storage] Failed to get user data:', error);
  }
  return null;
};

const clearUserFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    console.log('[Storage] User data cleared from AsyncStorage');
  } catch (error) {
    console.error('[Storage] Failed to clear user data:', error);
  }
};

// Initialize auth state
export const initializeAuth = async (): Promise<AuthUser | null> => {
  console.log('[Firebase] Initializing auth...');
  
  // First, try to get user from AsyncStorage immediately
  const storedUser = await getUserFromStorage();
  if (storedUser) {
    console.log('[Storage] Found stored user data:', storedUser.email);
  }
  
  return new Promise((resolve) => {
    let resolved = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (resolved) return;
      
      console.log('[Firebase] Auth state changed, user:', firebaseUser?.email || 'none');
      
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          const authUser: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData?.name || firebaseUser.displayName || '',
            username: userData?.username || firebaseUser.email!.split('@')[0],
            role: userData?.role || 'passenger',
            phone: userData?.phone || '',
            avatar: userData?.avatar || firebaseUser.photoURL || '',
            verified: firebaseUser.emailVerified
          };
          
          // Save user data to AsyncStorage for backup
          await saveUserToStorage(authUser);
          
          console.log('[Firebase] Auth restored for user:', authUser.email);
          resolved = true;
          unsubscribe();
          resolve(authUser);
        } catch (error) {
          console.error('[Firebase] Error getting user data:', error);
          
          // Try to get user data from AsyncStorage as fallback
          const storedUser = await getUserFromStorage();
          if (storedUser && storedUser.email === firebaseUser.email) {
            console.log('[Storage] Using stored user data as fallback');
            resolved = true;
            unsubscribe();
            resolve(storedUser);
          } else {
            resolved = true;
            unsubscribe();
            resolve(null);
          }
        }
      } else {
        console.log('[Firebase] No authenticated user found');
        
        // If we have stored user data but Firebase says no user, clear storage
        if (storedUser) {
          console.log('[Storage] Firebase says no user, but we have stored data - clearing storage');
          await clearUserFromStorage();
        }
        
        resolved = true;
        unsubscribe();
        resolve(null);
      }
    });
    
    // Add a timeout to prevent hanging
    setTimeout(() => {
      if (!resolved) {
        console.log('[Firebase] Auth initialization timeout, using stored data if available');
        resolved = true;
        unsubscribe();
        resolve(storedUser);
      }
    }, 3000); // 3 second timeout
  });
};

// Login function
export const login = async ({ email, password }: { email: string; password: string }): Promise<AuthUser> => {
  console.log('[Firebase] Attempting login for:', email);
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();
    
    const authUser: AuthUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData?.name || firebaseUser.displayName || '',
      username: userData?.username || firebaseUser.email!.split('@')[0],
      role: userData?.role || 'passenger',
      phone: userData?.phone || '',
      avatar: userData?.avatar || firebaseUser.photoURL || '',
      verified: firebaseUser.emailVerified
    };
    
    // Save user data to AsyncStorage for persistence
    await saveUserToStorage(authUser);
    
    console.log('[Firebase] Login successful for:', email);
    return authUser;
  } catch (error: any) {
    console.log('[Firebase] Login failed:', error?.message || 'Unknown error');
    throw error;
  }
};

// Register function
export const register = async (credentials: RegisterCredentials): Promise<AuthUser> => {
  console.log('[Firebase] Attempting registration for:', credentials.email);
  
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );
    const firebaseUser = userCredential.user;
    
    // Update display name
    await updateProfile(firebaseUser, {
      displayName: credentials.name
    });
    
    // Generate username from email if not provided
    const username = credentials.username || credentials.email.split('@')[0];
    
    // Create user document in Firestore
    const userData = {
      email: credentials.email,
      name: credentials.name,
      username: username,
      role: credentials.role || 'passenger',
      phone: credentials.phone || '',
      avatar: '',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    const authUser: AuthUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: credentials.name,
      username: username,
      role: credentials.role || 'passenger',
      phone: credentials.phone || '',
      avatar: '',
      verified: false
    };
    
    // Save user data to AsyncStorage for persistence
    await saveUserToStorage(authUser);
    
    console.log('[Firebase] Registration successful for:', credentials.email);
    return authUser;
  } catch (error: any) {
    console.log('[Firebase] Registration failed:', error?.message || 'Unknown error');
    throw error;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  console.log('[Firebase] Logging out user');
  try {
    await signOut(auth);
    // Clear user data from AsyncStorage
    await clearUserFromStorage();
    console.log('[Firebase] Logout complete');
  } catch (error) {
    console.error('[Firebase] Logout failed:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Auth state listener
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData?.name || firebaseUser.displayName || '',
          username: userData?.username || firebaseUser.email!.split('@')[0],
          role: userData?.role || 'passenger',
          phone: userData?.phone || '',
          avatar: userData?.avatar || firebaseUser.photoURL || '',
          verified: firebaseUser.emailVerified
        };
        
        // Save user data to AsyncStorage for persistence
        await saveUserToStorage(authUser);
        
        callback(authUser);
      } catch (error) {
        console.error('[Firebase] Error getting user data:', error);
        callback(null);
      }
    } else {
      // Clear AsyncStorage when user is logged out
      await clearUserFromStorage();
      callback(null);
    }
  });
};
