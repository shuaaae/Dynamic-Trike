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

interface OnboardingScreen2Props {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onSkip }) => {
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
        <Text style={styles.title}>Navigating Your Journey: Onboarding Essentials</Text>
        
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../../assets/images/onboarding/onboard2.png')} 
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
  personContainer: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  person: {
    position: 'absolute',
    bottom: 0,
    left: 50,
  },
  head: {
    width: 30,
    height: 30,
    backgroundColor: '#D2B48C',
    borderRadius: 15,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  beanie: {
    width: 35,
    height: 20,
    backgroundColor: '#4ADE80',
    borderRadius: 17,
    position: 'absolute',
    top: -5,
    left: -2,
  },
  pomPom: {
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    position: 'absolute',
    top: -2,
    left: 13,
  },
  body: {
    width: 40,
    height: 50,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    position: 'absolute',
    top: 25,
    left: -5,
  },
  leftArm: {
    width: 15,
    height: 30,
    backgroundColor: '#D2B48C',
    borderRadius: 7,
    position: 'absolute',
    top: 30,
    left: -15,
  },
  rightArm: {
    width: 15,
    height: 30,
    backgroundColor: '#D2B48C',
    borderRadius: 7,
    position: 'absolute',
    top: 30,
    right: -15,
  },
  leftLeg: {
    width: 20,
    height: 40,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    position: 'absolute',
    top: 70,
    left: -5,
  },
  rightLeg: {
    width: 20,
    height: 40,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    position: 'absolute',
    top: 70,
    right: -5,
  },
  leftFoot: {
    width: 25,
    height: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    position: 'absolute',
    top: 105,
    left: -7,
  },
  rightFoot: {
    width: 25,
    height: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    position: 'absolute',
    top: 105,
    right: -7,
  },
  book: {
    width: 40,
    height: 30,
    backgroundColor: '#4ADE80',
    borderRadius: 4,
    position: 'absolute',
    top: 50,
    left: 20,
  },
  mapPin: {
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    position: 'absolute',
    top: 40,
    left: 10,
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
