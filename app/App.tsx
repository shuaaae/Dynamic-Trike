import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// Import SafeAreaProvider with fallback
let SafeAreaProvider: any = ({ children }: { children: React.ReactNode }) => children;

try {
  const { SafeAreaProvider: SafeAreaProviderComponent } = require('react-native-safe-area-context');
  SafeAreaProvider = SafeAreaProviderComponent;
} catch (error) {
  console.log('SafeAreaProvider not available, using fallback');
}

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { SplashProvider, useSplash } from './contexts/SplashContext';
import { DriverVerificationProvider } from './contexts/DriverVerificationContext';
import { AuthOptionsScreen } from './screens/AuthOptionsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { SearchScreen } from './screens/SearchScreen';
import { TransportScreen } from './screens/TransportScreen';
import MapSelectionScreen from './screens/MapSelectionScreen';
import { MainTabNavigator } from './navigation/MainTabNavigator';
import { OnboardingFlow } from './screens/onboarding';
import { SplashScreen } from './screens/SplashScreen';
import { 
  LicenseCaptureScreen, 
  LicenseDetailsScreen, 
  FaceVerificationScreen,
  VehicleDetailsScreen, 
  VerificationReviewScreen 
} from './screens/verification';
import { DevSettingsScreen } from './screens/DevSettingsScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthOptions" component={AuthOptionsScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="LicenseCapture" component={LicenseCaptureScreen} />
      <Stack.Screen name="LicenseDetails" component={LicenseDetailsScreen} />
      <Stack.Screen name="FaceVerification" component={FaceVerificationScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="VerificationReview" component={VerificationReviewScreen} />
      <Stack.Screen name="DevSettings" component={DevSettingsScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.8, 1],
                  extrapolate: 'clamp',
                }),
              },
            };
          },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      />
      <Stack.Screen 
        name="Transport" 
        component={TransportScreen as any}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.8, 1],
                  extrapolate: 'clamp',
                }),
              },
            };
          },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      />
      <Stack.Screen 
        name="MapSelection" 
        component={MapSelectionScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.8, 1],
                  extrapolate: 'clamp',
                }),
              },
            };
          },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      />
      <Stack.Screen name="DevSettings" component={DevSettingsScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();

  console.log('[AppNavigator] user:', user?.email || 'null', 'loading:', authLoading);

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

function MainApp() {
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

function AppWithSplash() {
  const { isSplashVisible, hideSplash } = useSplash();

  // Show splash screen first
  if (isSplashVisible) {
    return <SplashScreen onFinish={hideSplash} />;
  }

  // Show main app after splash
  return <MainApp />;
}

function AppWithAuthCheck() {
  const { user, loading: authLoading } = useAuth();
  const { hasSeenOnboarding, loading: onboardingLoading } = useOnboarding();
  const { isSplashVisible, hideSplash } = useSplash();

  console.log('[AppWithAuthCheck] user:', user?.email || 'null', 'authLoading:', authLoading, 'onboardingLoading:', onboardingLoading);

  // Show loading while checking auth state
  if (authLoading || onboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is already logged in, skip splash and go directly to app
  if (user) {
    console.log('[AppWithAuthCheck] User logged in, showing AppStack');
    return (
      <NavigationContainer>
        <AppStack />
        <StatusBar style="auto" />
      </NavigationContainer>
    );
  }

  // Show splash screen for non-authenticated users
  if (isSplashVisible) {
    return <SplashScreen onFinish={hideSplash} />;
  }

  // Show onboarding for first-time users
  if (!hasSeenOnboarding) {
    return <OnboardingFlow />;
  }

  // Show auth flow for users who have seen onboarding
  return (
    <NavigationContainer>
      <AuthStack />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SplashProvider>
        <OnboardingProvider>
          <AuthProvider>
            <DriverVerificationProvider>
              <AppWithAuthCheck />
            </DriverVerificationProvider>
          </AuthProvider>
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
