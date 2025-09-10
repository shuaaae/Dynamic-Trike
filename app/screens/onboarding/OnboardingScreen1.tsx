import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface OnboardingScreen1Props {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onNext, onSkip }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.appName}>DynamicTrike</Text>
        </View>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Aboard: Get Started with Us!</Text>
        
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../../assets/images/onboarding/onboard1.png')} 
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Navigation Button */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={onNext} style={styles.nextButton}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58BC6B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4ADE80',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    lineHeight: 36,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    maxHeight: 400,
  },
  suitcase: {
    width: 200,
    height: 150,
    position: 'relative',
  },
  suitcaseBody: {
    width: 180,
    height: 120,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 10,
  },
  suitcaseTop: {
    width: 180,
    height: 30,
    backgroundColor: '#A0522D',
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    left: 10,
  },
  passport: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 20,
    backgroundColor: '#4ADE80',
    borderRadius: 2,
  },
  passportIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    position: 'absolute',
    top: 4,
    left: 9,
  },
  tickets: {
    position: 'absolute',
    top: 25,
    left: 60,
    width: 25,
    height: 15,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  plant: {
    position: 'absolute',
    top: 15,
    right: 30,
    width: 20,
    height: 20,
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  sunglasses: {
    position: 'absolute',
    top: 45,
    left: 30,
    width: 25,
    height: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
  },
  camera: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 20,
    height: 15,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  beachBall: {
    position: 'absolute',
    top: 70,
    left: 50,
    width: 20,
    height: 20,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
  },
  mapPin1: {
    position: 'absolute',
    top: 80,
    right: 40,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  mapPin2: {
    position: 'absolute',
    top: 90,
    left: 80,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  luggageTag1: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 15,
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  luggageTag2: {
    position: 'absolute',
    top: 20,
    right: 0,
    width: 15,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nextButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextText: {
    color: '#58BC6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
