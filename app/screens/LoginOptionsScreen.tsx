import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

interface LoginOptionsScreenProps {
  navigation: any;
  onBack: () => void;
}

export const LoginOptionsScreen: React.FC<LoginOptionsScreenProps> = ({ navigation, onBack }) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInErrorState, setIsInErrorState] = useState(false);
  const { login } = useAuth();

  const handleGmailLogin = () => {
    setShowGmailModal(true);
  };

  const handleGmailSubmit = async () => {
    // Clear any previous error messages
    setErrorMessage('');
    setIsInErrorState(false);
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Validate Gmail email (optional - easy to remove)
    if (!email.includes('@gmail.com')) {
      setErrorMessage('Please enter a valid Gmail address');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting Gmail login with:', email);
      
      // Attempt to login with Gmail credentials using AuthContext
      await login({ email, password });
      
      console.log('Gmail login successful - closing modal and navigating');
      
      // Close modal and go back to main screen
      setShowGmailModal(false);
      setEmail('');
      setPassword('');
      setErrorMessage('');
      setIsInErrorState(false);
      onBack();
    } catch (error: any) {
      console.log('Caught error in handleGmailSubmit:', error?.message);
      console.log('Error type:', typeof error);
      console.log('Error details:', error);
      
      // Log error without triggering development overlay
      console.log('Gmail login failed:', error?.message || 'Unknown error');
      
      // Set error message for display
      let errorMsg = error?.message || 'Invalid email or password';
      
      // Simplify error messages for better UX
      if (errorMsg.includes('Invalid email or password') || errorMsg.includes('auth/invalid-credential')) {
        errorMsg = 'Email and password is wrong. Please check your credentials and try again.';
      } else if (errorMsg.includes('Cannot reach server') || errorMsg.includes('Server connection failed')) {
        errorMsg = 'Connection failed. Please check your internet connection and try again.';
      }
      
      console.log('Setting error message:', errorMsg);
      setErrorMessage(errorMsg);
      setIsInErrorState(true);
      
      // Ensure modal stays open
      console.log('Modal should stay open, showGmailModal:', showGmailModal);
    } finally {
      setLoading(false);
    }
  };



  const closeGmailModal = () => {
    setShowGmailModal(false);
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setIsInErrorState(false);
  };



  const handleMobileLogin = () => {
    // Handle mobile number login
    console.log('Mobile login pressed');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={[styles.contentContainer, { height: screenHeight - insets.top - insets.bottom }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/greenlogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Spacer to push buttons to bottom */}
        <View style={styles.spacer} />

        {/* Login Options */}
        <View style={styles.optionsContainer}>
          {/* Gmail Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleGmailLogin}>
            <View style={styles.buttonContent}>
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIconImage}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>Continue With Gmail</Text>
            </View>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Mobile Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleMobileLogin}>
            <View style={styles.buttonContent}>
              <View style={styles.mobileIcon}>
                <Text style={styles.mobileIconText}>📞</Text>
              </View>
              <Text style={styles.buttonText}>Continue With Mobile Number</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gmail Login Modal */}
      <Modal
        visible={showGmailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          // Only close if not loading, no error message, and not in error state
          if (!loading && !errorMessage && !isInErrorState) {
            closeGmailModal();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Account Login</Text>
                <Text style={styles.modalSubtitle}>Enter your Gmail credentials to sign in</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Gmail Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) {
                      setErrorMessage('');
                      setIsInErrorState(false);
                    }
                  }}
                  placeholder="Enter your Email"
                  placeholderTextColor="#6B7280"
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
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) {
                      setErrorMessage('');
                      setIsInErrorState(false);
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Error Message Indicator - Only show when modal is open */}
              {showGmailModal && errorMessage ? (
                <View style={styles.errorContainer}>
                  <View style={styles.errorIconContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                  </View>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <TouchableOpacity 
                    style={styles.errorDismissButton}
                    onPress={() => setErrorMessage('')}
                  >
                    <Text style={styles.errorDismissText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.modalLoginButton, loading && styles.buttonDisabled]}
                onPress={handleGmailSubmit}
                disabled={loading}
              >
                <Text style={styles.modalLoginButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={closeGmailModal}>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -50 }],
  },
  logo: {
    width: 200,
    height: 100,
  },
  spacer: {
    flex: 1,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 350,
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  mobileIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mobileIconText: {
    fontSize: 16,
  },
  buttonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  separatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
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
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#58BC6B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorIconContainer: {
    marginRight: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  errorDismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorDismissText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailText: {
    fontWeight: '600',
    color: '#58BC6B',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#F9FAFB',
    letterSpacing: 4,
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  resendButtonText: {
    color: '#58BC6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
