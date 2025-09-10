import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { LoginOptionsScreen } from './LoginOptionsScreen';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');

  const handleLoginPress = () => {
    setShowLoginOptions(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setEmail('');
    setPassword('');
  };

  // Show login options screen
  if (showLoginOptions) {
    return (
      <LoginOptionsScreen 
        navigation={navigation} 
        onBack={() => setShowLoginOptions(false)} 
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Top Green Section with Logo and Illustration */}
      <View style={[styles.topSection, { height: screenHeight * 0.7 - insets.top }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/greenlogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        
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
      <View style={[styles.bottomSection, { height: screenHeight * 0.3 + insets.bottom }]}>
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
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signupButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Welcome Back</Text>
                <Text style={styles.modalSubtitle}>Sign in to your DynamicTrike account</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.modalLoginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.modalLoginButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      </View>
    </TouchableWithoutFeedback>
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
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  modalLoginButton: {
    backgroundColor: '#58BC6B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalLoginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
