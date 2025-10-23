import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AuthOptionsScreenProps {
  navigation: any;
}

export const AuthOptionsScreen: React.FC<AuthOptionsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Top Green Section with Logo and Illustration */}
      <View style={[styles.topSection, { height: screenHeight * 0.7 }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/greenlogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Dynamic Trike</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assets/Illustraton.png')} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom White Section with Buttons */}
      <View style={[styles.bottomSection, { height: screenHeight * 0.3 }]}>
        {/* Wavy border */}
        <View style={styles.wavyBorder} />
        
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleRegisterPress}
          >
            <Text style={styles.signupButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58BC6B',
  },
  topSection: {
    backgroundColor: '#58BC6B',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  illustrationContainer: {
    position: 'absolute',
    bottom: -100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    height: '80%',
    zIndex: 2,
  },
  illustration: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  bottomSection: {
    backgroundColor: 'white',
    position: 'relative',
    zIndex: 1,
    justifyContent: 'flex-end',
  },
  wavyBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#58BC6B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});
