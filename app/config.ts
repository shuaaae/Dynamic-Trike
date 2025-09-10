// Firebase Configuration
// This file is now used for general app configuration
// Firebase-specific config is in lib/firebase.ts

export const APP_CONFIG = {
  // App version
  VERSION: '1.0.0',
  
  // App name
  NAME: 'Dynamic Trike',
  
  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};

// Environment variables (if using .env)
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};
