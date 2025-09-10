import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeAuth, login as firebaseLogin, logout as firebaseLogout, onAuthStateChange } from '../lib/firebaseAuth';
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

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing authentication...');
        const restoredUser = await initializeAuth();
        setUser(restoredUser);
        console.log('[Auth] Initialization complete, user:', restoredUser?.email || 'none');
      } catch (error: any) {
        console.log('[Auth] Initialization failed:', error?.message || 'Unknown error');
        // Try to get user from storage as fallback
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          const userData = await AsyncStorage.default.getItem('user_data');
          if (userData) {
            const storedUser = JSON.parse(userData);
            console.log('[Auth] Using stored user as fallback:', storedUser.email);
            setUser(storedUser);
          }
        } catch (storageError) {
          console.log('[Auth] Storage fallback failed:', storageError);
        }
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      console.log('[Auth] Auth state changed:', user?.email || 'none');
      setUser(user);
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
      setLoading(true);
      
      const userData = await firebaseLogin({ email, password });
      setUser(userData);
      
      console.log('[Auth] Login successful for:', email);
    } catch (error: any) {
      console.log('[Auth] Login failed:', error?.message || 'Unknown error');
      
      // Improve error messages for common connectivity issues
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.status === 0 || /status\s*:\s*0/i.test(String(error))) {
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
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      console.log('[Auth] Starting registration process for:', credentials.email);
      setLoading(true);
      
      // Import the register function from firebase
      const { register: firebaseRegister } = await import('../lib/firebaseAuth');
      const userData = await firebaseRegister(credentials);
      setUser(userData);
      
      console.log('[Auth] Registration successful for:', credentials.email);
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