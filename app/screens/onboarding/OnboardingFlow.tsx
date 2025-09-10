import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { OnboardingScreen1 } from './OnboardingScreen1';
import { OnboardingScreen2 } from './OnboardingScreen2';
import { OnboardingScreen3 } from './OnboardingScreen3';
import { useOnboarding } from '../../contexts/OnboardingContext';

export const OnboardingFlow: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { completeOnboarding } = useOnboarding();

  const handleNext = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 0 && (
        <OnboardingScreen1 onNext={handleNext} onSkip={handleSkip} />
      )}
      {currentScreen === 1 && (
        <OnboardingScreen2 onNext={handleNext} onSkip={handleSkip} />
      )}
      {currentScreen === 2 && (
        <OnboardingScreen3 onNext={handleNext} onSkip={handleSkip} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58BC6B',
  },
});
