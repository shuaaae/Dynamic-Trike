import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  hasSeenOnboarding: boolean;
  loading: boolean;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

const ONBOARDING_KEY = '@has_seen_onboarding';

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value: OnboardingContextType = {
    hasSeenOnboarding,
    loading,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
