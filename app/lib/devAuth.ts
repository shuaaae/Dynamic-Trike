import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types/database';

const DEV_MODE = __DEV__; // This will be true in development mode
const DEV_USER_KEY = 'dev_user_data';

// Development test user
const DEV_USER: AuthUser = {
  id: 'dev-user-123',
  email: 'dev@test.com',
  name: 'Development User',
  username: 'devuser',
  role: 'driver', // Set to driver for testing
  phone: '+1234567890',
  avatar: '',
  verified: true
};

export const isDevMode = () => DEV_MODE;

export const getDevUser = (): AuthUser | null => {
  if (!DEV_MODE) return null;
  return DEV_USER;
};

export const saveDevUser = async (): Promise<void> => {
  if (!DEV_MODE) return;
  
  try {
    await AsyncStorage.setItem(DEV_USER_KEY, JSON.stringify(DEV_USER));
    console.log('[DevAuth] Development user saved to storage');
  } catch (error) {
    console.error('[DevAuth] Failed to save dev user:', error);
  }
};

export const getDevUserFromStorage = async (): Promise<AuthUser | null> => {
  if (!DEV_MODE) return null;
  
  try {
    const userData = await AsyncStorage.getItem(DEV_USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('[DevAuth] Development user restored from storage');
      return user;
    }
  } catch (error) {
    console.error('[DevAuth] Failed to get dev user from storage:', error);
  }
  return null;
};

export const clearDevUser = async (): Promise<void> => {
  if (!DEV_MODE) return;
  
  try {
    await AsyncStorage.removeItem(DEV_USER_KEY);
    console.log('[DevAuth] Development user cleared from storage');
  } catch (error) {
    console.error('[DevAuth] Failed to clear dev user:', error);
  }
};

// Auto-login for development
export const autoLoginDev = async (): Promise<AuthUser | null> => {
  if (!DEV_MODE) return null;
  
  console.log('[DevAuth] Auto-login enabled for development mode');
  
  // Check if we already have a dev user in storage
  const storedDevUser = await getDevUserFromStorage();
  if (storedDevUser) {
    console.log('[DevAuth] Using stored dev user:', storedDevUser.email);
    return storedDevUser;
  }
  
  // Save and return the dev user
  await saveDevUser();
  console.log('[DevAuth] Created new dev user:', DEV_USER.email);
  return DEV_USER;
};
