import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { SplashProvider, useSplash } from './contexts/SplashContext';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { MainTabNavigator } from './navigation/MainTabNavigator';
import { OnboardingFlow } from './screens/onboarding';
import { SplashScreen } from './screens/SplashScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return <MainTabNavigator />;
}

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

function OnboardingWrapper() {
  const { hasSeenOnboarding, loading: onboardingLoading } = useOnboarding();
  const { isSplashVisible, hideSplash } = useSplash();

  if (onboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show splash screen first
  if (isSplashVisible) {
    return <SplashScreen onFinish={hideSplash} />;
  }

  // Show onboarding for first-time users
  if (!hasSeenOnboarding) {
    return <OnboardingFlow />;
  }

  // Show auth flow for users who have seen onboarding
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SplashProvider>
        <OnboardingProvider>
          <OnboardingWrapper />
        </OnboardingProvider>
      </SplashProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
