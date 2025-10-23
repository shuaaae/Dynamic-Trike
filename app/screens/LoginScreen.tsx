import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInErrorState, setIsInErrorState] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorOpacity] = useState(new Animated.Value(0));
  const { login } = useAuth();
  const insets = useSafeAreaInsets();


  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      setIsInErrorState(true);
      setShowError(true);
      setHasLoginError(true);
      return;
    }

    // Clear any previous error messages only when starting a new login attempt
    setErrorMessage('');
    setIsInErrorState(false);
    setShowError(false);
    setHasLoginError(false);

    try {
      setIsLoggingIn(true);
      await login({ email, password });
      // Navigation will be handled by the auth state change
      setIsLoggingIn(false); // Set loading to false on success
      return; // Exit early on success
    } catch (error: any) {
      // Set error state immediately
      setIsInErrorState(true);
      setShowError(true);
      setHasLoginError(true);
      
      // Set error message for display
      let errorMsg = 'Email and password is wrong. Please check your credentials and try again.';
      
      // Handle specific Firebase auth errors
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
        errorMsg = 'Email and password is wrong. Please check your credentials and try again.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.';
      } else if (error?.code === 'auth/network-request-failed') {
        errorMsg = 'Connection failed. Please check your internet connection and try again.';
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      // Set all error states together to avoid race conditions
      setErrorMessage(errorMsg);
      setIsInErrorState(true);
      setShowError(true);
      setHasLoginError(true);
      
      // Set loading to false on error
      setIsLoggingIn(false);
    }
  };

  const clearError = () => {
    // Animate out
    Animated.timing(errorOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setErrorMessage('');
      setIsInErrorState(false);
      setShowError(false);
      setHasLoginError(false);
    });
  };

  // Test AsyncStorage on component mount
  useEffect(() => {
    const testAsyncStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        console.log('[LoginScreen] AsyncStorage test - user_data:', userData ? 'Found' : 'Not found');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('[LoginScreen] Stored user:', user.email, 'Role:', user.role);
        }
      } catch (error) {
        console.log('[LoginScreen] AsyncStorage test failed:', error);
      }
    };
    testAsyncStorage();
  }, []);


  // Animate error message in when it appears
  useEffect(() => {
    if (errorMessage || isInErrorState || showError || hasLoginError) {
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [errorMessage, isInErrorState, showError, hasLoginError]);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (errorMessage || isInErrorState || showError || hasLoginError) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [errorMessage, isInErrorState, showError, hasLoginError]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('AuthOptions');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.formContainer}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/greenlogo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>DynamicTrike</Text>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Sign in to your account</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, isLoggingIn && styles.inputDisabled]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) {
                      clearError();
                    }
                  }}
                  placeholder="Please Enter your Email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoggingIn}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, isLoggingIn && styles.inputDisabled]}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errorMessage) {
                        clearError();
                      }
                    }}
                    placeholder="Please Enter your Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoggingIn}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message Display */}
              {(errorMessage || isInErrorState || showError || hasLoginError) && (
                <Animated.View style={[styles.errorContainer, { opacity: errorOpacity }]}>
                  <View style={styles.errorIconContainer}>
                    <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorText}>
                      {errorMessage || 'Email and password is wrong. Please check your credentials and try again.'}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoggingIn && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>


              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58BC6B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    flex: 1,
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
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#58BC6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 16,
    color: '#58BC6B',
    fontWeight: '600',
  },
});