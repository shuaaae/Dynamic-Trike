import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SplashContextType {
  isSplashVisible: boolean;
  hideSplash: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

interface SplashProviderProps {
  children: ReactNode;
}

export const SplashProvider: React.FC<SplashProviderProps> = ({ children }) => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const hideSplash = () => {
    setIsSplashVisible(false);
  };

  const value: SplashContextType = {
    isSplashVisible,
    hideSplash,
  };

  return (
    <SplashContext.Provider value={value}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = (): SplashContextType => {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};
