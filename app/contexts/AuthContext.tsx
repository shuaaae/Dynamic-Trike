import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, login as firebaseLogin, logout as firebaseLogout, onAuthStateChange, getCurrentUser, register as firebaseRegister } from '../lib/firebaseAuth';
import { autoLoginDev, isDevMode, clearDevUser } from '../lib/devAuth';
import { RegisterCredentials } from '../types/database';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
  [key: string]: any;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [shouldClearStorage, setShouldClearStorage] = useState(false);

  // Initialize auth on app start
  useEffect(() => {
    let isInitialized = false;
    let hasStoredUser = false;
    
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing authentication...');
        
        // First, check if we have a stored user
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const storedUser = JSON.parse(userData);
          console.log('[Auth] Found stored user:', storedUser.email);
          hasStoredUser = true;
          // Set the user immediately for faster loading
          setUser(storedUser);
        }
        
        // Development mode: Auto-login with dev user (temporarily disabled for testing)
        if (false && isDevMode()) {
          console.log('[Auth] Development mode detected - using auto-login');
          const devUser = await autoLoginDev();
          if (devUser) {
            setUser(devUser);
            setLoading(false);
            setInitialized(true);
            isInitialized = true;
            console.log('[Auth] Development user logged in:', devUser.email);
            return;
          }
        }
        
        // Try to restore from Firebase (this will verify the stored user or get fresh data)
        console.log('[Auth] Starting initializeAuth...');
        const restoredUser = await initializeAuth();
        if (restoredUser) {
          setUser(restoredUser);
          console.log('[Auth] User restored from Firebase/Storage:', restoredUser.email);
        } else if (!hasStoredUser) {
          console.log('[Auth] No user found in Firebase or storage');
        }
      } catch (error: any) {
        console.log('[Auth] Initialization failed:', error?.message || 'Unknown error');
        // If we have a stored user, keep it even if Firebase fails
        if (!hasStoredUser) {
          try {
            const userData = await AsyncStorage.getItem('user_data');
            if (userData) {
              const storedUser = JSON.parse(userData);
              console.log('[Auth] Using stored user as fallback:', storedUser.email);
              setUser(storedUser);
            }
          } catch (storageError) {
            console.log('[Auth] Storage fallback failed:', storageError);
          }
        }
      } finally {
        setLoading(false);
        setInitialized(true);
        isInitialized = true;
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      console.log('[Auth] Auth state changed:', user?.email || 'none');
      console.log('[Auth] Initialized:', isInitialized, 'HasStoredUser:', hasStoredUser, 'IsLoggingIn:', isLoggingIn);
      if (user) {
        // User is authenticated, set the user
        console.log('[Auth] Setting user from auth state:', user.email);
        console.log('[Auth] User role from auth state:', user.role);
        console.log('[Auth] Is driver from auth state:', user.role === 'driver');
        setUser(user);
      } else {
        // Only clear user if we've completed initialization and don't have a stored user
        if (!isInitialized) {
          console.log('[Auth] Skipping user clear during initialization - keeping any stored user');
        } else if (hasStoredUser) {
          console.log('[Auth] Keeping stored user even though Firebase shows no user');
        } else if (isLoggingIn) {
          console.log('[Auth] Skipping user clear during login process');
        } else {
          console.log('[Auth] Clearing user - no stored user and Firebase shows no user');
          // Only clear user if we're sure the user should be logged out
          // Don't clear storage during app initialization
          if (initialized && shouldClearStorage) {
            setUser(null);
          }
        }
      }
      setLoading(false);
    });

    // Initialize auth
    initAuth();

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      console.log('[Auth] Starting login process for:', email);
      setIsLoggingIn(true);
      // Don't set loading here - let LoginScreen handle it
      
      const userData = await firebaseLogin({ email, password });
      setUser(userData);
      
      console.log('[Auth] Login successful for:', email);
      console.log('[Auth] User role:', userData.role);
      console.log('[Auth] Is driver:', userData.role === 'driver');
    } catch (error: any) {
      console.log('[Auth] Login failed:', error?.message || 'Unknown error');
      console.log('[Auth] Error code:', error?.code);
      
      // Improve error messages for common connectivity issues
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = 'Cannot reach server. Please check your internet connection and try again.';
      } else if (error?.status === 0 || /status\s*:\s*0/i.test(String(error))) {
        errorMessage = 'Cannot reach server. Please check your internet connection and try again.';
      } else if (error?.message?.includes('Something went wrong')) {
        errorMessage = 'Server connection failed. Check your network and try again.';
      } else if (error?.response?.data?.identity) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error?.response?.data?.email) {
        errorMessage = `Email error: ${error.response.data.email.message}`;
      } else if (error?.response?.data?.password) {
        errorMessage = `Password error: ${error.response.data.password.message}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
    // Removed finally block - let LoginScreen handle loading state
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      console.log('[Auth] Starting registration process for:', credentials.email);
      setLoading(true);
      
      // Register user with Firebase
      const userData = await firebaseRegister(credentials);
      setUser(userData);
      
      console.log('[Auth] Registration successful for:', credentials.email);
      console.log('[Auth] User role:', userData.role);
      console.log('[Auth] Is driver:', userData.role === 'driver');
    } catch (error: any) {
      console.log('[Auth] Registration failed:', error?.message || 'Unknown error');
      
      // Improve error messages for common connectivity issues
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error?.status === 0 || /status\s*:\s*0/i.test(String(error))) {
        errorMessage = 'Cannot reach server. Please check your internet connection and try again.';
      } else if (error?.message?.includes('Something went wrong')) {
        errorMessage = 'Server connection failed. Check your network and try again.';
      } else if (error?.response?.data?.email) {
        errorMessage = `Email error: ${error.response.data.email.message}`;
      } else if (error?.response?.data?.username) {
        errorMessage = `Username error: ${error.response.data.username.message}`;
      } else if (error?.response?.data?.password) {
        errorMessage = `Password error: ${error.response.data.password.message}`;
      } else if (error?.response?.data?.name) {
        errorMessage = `Name error: ${error.response.data.name.message}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Starting logout process');
      setShouldClearStorage(true); // Allow clearing storage on explicit logout
      
      // Clear dev user in development mode
      if (isDevMode()) {
        await clearDevUser();
        console.log('[Auth] Development user cleared');
      }
      
      await firebaseLogout();
      setUser(null);
      console.log('[Auth] Logout successful');
    } catch (error: any) {
      console.log('[Auth] Logout failed:', error?.message || 'Unknown error');
      // Even if logout fails, clear local state
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};