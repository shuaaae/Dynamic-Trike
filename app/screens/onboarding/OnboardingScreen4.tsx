import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface OnboardingScreen4Props {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingScreen4: React.FC<OnboardingScreen4Props> = ({ onNext, onSkip }) => {
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
        <Text style={styles.title}>Track Your Journey: Live Updates & History</Text>
        
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.phoneContainer}>
            {/* Phone mockup */}
            <View style={styles.phone}>
              {/* Screen content */}
              <View style={styles.phoneScreen}>
                {/* Header */}
                <View style={styles.phoneHeader}>
                  <Text style={styles.phoneTitle}>Trip History</Text>
                </View>
                
                {/* Trip items */}
                <View style={styles.tripItem}>
                  <View style={styles.tripIcon}>
                    <Text style={styles.tripEmoji}>🚲</Text>
                  </View>
                  <View style={styles.tripDetails}>
                    <Text style={styles.tripRoute}>Market to University</Text>
                    <Text style={styles.tripTime}>2:30 PM • 3.2 km</Text>
                  </View>
                  <Text style={styles.tripPrice}>₱28.50</Text>
                </View>
                
                <View style={styles.tripItem}>
                  <View style={styles.tripIcon}>
                    <Text style={styles.tripEmoji}>🚲</Text>
                  </View>
                  <View style={styles.tripDetails}>
                    <Text style={styles.tripRoute}>Home to Mall</Text>
                    <Text style={styles.tripTime}>1:15 PM • 2.1 km</Text>
                  </View>
                  <Text style={styles.tripPrice}>₱22.30</Text>
                </View>
                
                <View style={styles.tripItem}>
                  <View style={styles.tripIcon}>
                    <Text style={styles.tripEmoji}>🚲</Text>
                  </View>
                  <View style={styles.tripDetails}>
                    <Text style={styles.tripRoute}>Office to Station</Text>
                    <Text style={styles.tripTime}>12:00 PM • 1.8 km</Text>
                  </View>
                  <Text style={styles.tripPrice}>₱19.80</Text>
                </View>
              </View>
            </View>
            
            {/* Floating elements */}
            <View style={styles.floatingElement1}>
              <Text style={styles.floatingText}>Live</Text>
            </View>
            <View style={styles.floatingElement2}>
              <Text style={styles.floatingText}>GPS</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation Button */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={onNext} style={styles.nextButton}>
          <Text style={styles.nextText}>Get Started</Text>
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
  },
  phoneContainer: {
    width: 200,
    height: 300,
    position: 'relative',
  },
  phone: {
    width: 160,
    height: 280,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    position: 'absolute',
    top: 10,
    left: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 8,
    padding: 12,
  },
  phoneHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  phoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tripIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripEmoji: {
    fontSize: 16,
  },
  tripDetails: {
    flex: 1,
  },
  tripRoute: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  tripTime: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  tripPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#58BC6B',
  },
  floatingElement1: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  floatingText: {
    color: 'white',
    fontSize: 10,
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
