import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { RegisterCredentials } from '../types/database';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    username: '', // Keep for type compatibility but won't be used
    role: 'passenger',
    phone: '', // Keep for type compatibility but won't be used
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');

  const handleInputChange = (field: keyof RegisterCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
        
        {/* Top Green Section with Logo */}
        <View style={[styles.topSection, { height: screenHeight * 0.25 - insets.top }]}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Create Account Title */}
          <Text style={styles.topTitle}>Create Account</Text>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/greenlogo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Join Dynamic Trike today</Text>
          </View>
        </View>

        {/* Bottom White Section with Form */}
        <View style={[styles.bottomSection, { height: screenHeight * 0.75 + insets.bottom }]}>
          {/* Wavy border */}
          <View style={styles.wavyBorder} />
          
          <KeyboardAvoidingView 
            style={styles.formContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Account Type *</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'passenger' && styles.roleButtonActive
                    ]}
                    onPress={() => handleInputChange('role', 'passenger')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === 'passenger' && styles.roleButtonTextActive
                    ]}>
                      Passenger
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'driver' && styles.roleButtonActive
                    ]}
                    onPress={() => handleInputChange('role', 'driver')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === 'driver' && styles.roleButtonTextActive
                    ]}>
                      Driver
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Create a password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.passwordConfirm}
                  onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                  placeholder="Confirm your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
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
    paddingTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
  topTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: 'white',
    position: 'relative',
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
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
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleButtonActive: {
    backgroundColor: '#58BC6B',
    borderColor: '#58BC6B',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: 'white',
  },
  button: {
    backgroundColor: '#58BC6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  linkText: {
    fontSize: 16,
    color: '#58BC6B',
    fontWeight: '600',
  },
});