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

interface OnboardingScreen3Props {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ onNext, onSkip }) => {
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
        <Text style={styles.title}>Smart Fare Calculation: Real-Time Pricing</Text>
        
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../../assets/images/onboarding/onboard3.png')} 
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
    backgroundColor: '#58BC6B',
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
  tricycleContainer: {
    width: 250,
    height: 200,
    position: 'relative',
  },
  tricycle: {
    position: 'absolute',
    bottom: 0,
    left: 50,
  },
  tricycleBody: {
    width: 80,
    height: 40,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    position: 'absolute',
    top: 20,
    left: 0,
  },
  frontWheel: {
    width: 25,
    height: 25,
    backgroundColor: '#374151',
    borderRadius: 12,
    position: 'absolute',
    top: 50,
    left: -10,
  },
  backWheel1: {
    width: 25,
    height: 25,
    backgroundColor: '#374151',
    borderRadius: 12,
    position: 'absolute',
    top: 50,
    right: -10,
  },
  backWheel2: {
    width: 25,
    height: 25,
    backgroundColor: '#374151',
    borderRadius: 12,
    position: 'absolute',
    top: 50,
    right: 10,
  },
  handlebar: {
    width: 60,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    position: 'absolute',
    top: 10,
    left: -20,
  },
  seat: {
    width: 30,
    height: 20,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    position: 'absolute',
    top: 25,
    left: 25,
  },
  priceDisplay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceText: {
    color: '#58BC6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  distanceIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  fuelIndicator: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fuelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
