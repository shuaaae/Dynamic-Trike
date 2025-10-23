import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverVerification } from '../../contexts/DriverVerificationContext';

interface LicenseDetailsScreenProps {
  navigation: any;
}

export const LicenseDetailsScreen: React.FC<LicenseDetailsScreenProps> = ({ navigation }) => {
  const { verificationData, updateVerificationData } = useDriverVerification();
  const [formData, setFormData] = useState({
    licenseNumber: verificationData.licenseNumber || '',
    licenseExpiry: verificationData.licenseExpiry || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.length < 5) {
      newErrors.licenseNumber = 'License number must be at least 5 characters';
    }

    if (!formData.licenseExpiry.trim()) {
      newErrors.licenseExpiry = 'License expiry date is required';
    } else {
      // Basic date validation (MM/DD/YYYY or DD/MM/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(formData.licenseExpiry)) {
        newErrors.licenseExpiry = 'Please enter date in MM/DD/YYYY format';
      } else {
        // Check if date is not expired
        const [month, day, year] = formData.licenseExpiry.split('/').map(Number);
        const expiryDate = new Date(year, month - 1, day);
        const today = new Date();
        if (expiryDate < today) {
          newErrors.licenseExpiry = 'License has expired';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateVerificationData({
        licenseNumber: formData.licenseNumber.trim(),
        licenseExpiry: formData.licenseExpiry.trim(),
      });
      navigation.navigate('FaceVerification');
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('AuthOptions');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>License Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Enter License Information</Text>
            <Text style={styles.instructionsText}>
              Please provide the details from your driver's license. This information will be used for verification purposes.
            </Text>
          </View>

          {/* License Preview */}
          {verificationData.licenseImage && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>License Photo</Text>
              <View style={styles.imageContainer}>
                <Ionicons name="document-text" size={40} color="#58BC6B" />
                <Text style={styles.imageText}>License captured</Text>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Number *</Text>
              <TextInput
                style={[styles.input, errors.licenseNumber && styles.inputError]}
                value={formData.licenseNumber}
                onChangeText={(value) => handleInputChange('licenseNumber', value)}
                placeholder="Enter your license number"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {errors.licenseNumber && (
                <Text style={styles.errorText}>{errors.licenseNumber}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Expiry Date *</Text>
              <TextInput
                style={[styles.input, errors.licenseExpiry && styles.inputError]}
                value={formData.licenseExpiry}
                onChangeText={(value) => handleInputChange('licenseExpiry', value)}
                placeholder="MM/DD/YYYY"
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.licenseExpiry && (
                <Text style={styles.errorText}>{errors.licenseExpiry}</Text>
              )}
              <Text style={styles.helperText}>
                Enter the expiry date in MM/DD/YYYY format
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#58BC6B" />
            <Text style={styles.infoText}>
              Your license information will be securely stored and used only for verification purposes. 
              We will verify this information with the relevant authorities.
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  instructionsContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  previewContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  imageContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#58BC6B',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#58BC6B',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#58BC6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
