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
import { VehicleDetails } from '../../types/database';

interface VehicleDetailsScreenProps {
  navigation: any;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ navigation }) => {
  const { verificationData, updateVerificationData } = useDriverVerification();
  const [formData, setFormData] = useState<VehicleDetails>({
    make: verificationData.vehicleDetails.make || '',
    model: verificationData.vehicleDetails.model || '',
    year: verificationData.vehicleDetails.year || undefined,
    color: verificationData.vehicleDetails.color || '',
    plateNumber: verificationData.vehicleDetails.plateNumber || '',
    engineNumber: verificationData.vehicleDetails.engineNumber || '',
    chassisNumber: verificationData.vehicleDetails.chassisNumber || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof VehicleDetails, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.make?.trim()) {
      newErrors.make = 'Vehicle make is required';
    }

    if (!formData.model?.trim()) {
      newErrors.model = 'Vehicle model is required';
    }

    if (!formData.year) {
      newErrors.year = 'Vehicle year is required';
    } else if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }

    if (!formData.color?.trim()) {
      newErrors.color = 'Vehicle color is required';
    }

    if (!formData.plateNumber?.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    } else if (formData.plateNumber.length < 3) {
      newErrors.plateNumber = 'Plate number must be at least 3 characters';
    }

    if (!formData.engineNumber?.trim()) {
      newErrors.engineNumber = 'Engine number is required';
    } else if (formData.engineNumber.length < 5) {
      newErrors.engineNumber = 'Engine number must be at least 5 characters';
    }

    if (!formData.chassisNumber?.trim()) {
      newErrors.chassisNumber = 'Chassis number is required';
    } else if (formData.chassisNumber.length < 10) {
      newErrors.chassisNumber = 'Chassis number must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateVerificationData({
        vehicleDetails: {
          make: formData.make?.trim() || '',
          model: formData.model?.trim() || '',
          year: formData.year,
          color: formData.color?.trim() || '',
          plateNumber: formData.plateNumber?.trim() || '',
          engineNumber: formData.engineNumber?.trim() || '',
          chassisNumber: formData.chassisNumber?.trim() || '',
        },
      });
      
      // Show success message and navigate to home
      Alert.alert(
        'Verification Complete!',
        'Your driver verification has been automatically approved. You can now start using the app as a driver.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
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
        <Text style={styles.headerTitle}>Vehicle Details</Text>
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
            <Text style={styles.instructionsTitle}>Enter Vehicle Information</Text>
            <Text style={styles.instructionsText}>
              Please provide details about your tricycle. This information will be used for verification and safety purposes.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Vehicle Make and Model */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Make *</Text>
                <TextInput
                  style={[styles.input, errors.make && styles.inputError]}
                  value={formData.make}
                  onChangeText={(value) => handleInputChange('make', value)}
                  placeholder="e.g., Honda"
                  autoCapitalize="words"
                />
                {errors.make && (
                  <Text style={styles.errorText}>{errors.make}</Text>
                )}
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={[styles.input, errors.model && styles.inputError]}
                  value={formData.model}
                  onChangeText={(value) => handleInputChange('model', value)}
                  placeholder="e.g., TMX 155"
                  autoCapitalize="words"
                />
                {errors.model && (
                  <Text style={styles.errorText}>{errors.model}</Text>
                )}
              </View>
            </View>

            {/* Year and Color */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Year *</Text>
                <TextInput
                  style={[styles.input, errors.year && styles.inputError]}
                  value={formData.year?.toString() || ''}
                  onChangeText={(value) => handleInputChange('year', parseInt(value) || 0)}
                  placeholder="2020"
                  keyboardType="numeric"
                  maxLength={4}
                />
                {errors.year && (
                  <Text style={styles.errorText}>{errors.year}</Text>
                )}
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Color *</Text>
                <TextInput
                  style={[styles.input, errors.color && styles.inputError]}
                  value={formData.color}
                  onChangeText={(value) => handleInputChange('color', value)}
                  placeholder="e.g., Red"
                  autoCapitalize="words"
                />
                {errors.color && (
                  <Text style={styles.errorText}>{errors.color}</Text>
                )}
              </View>
            </View>

            {/* Plate Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Plate Number *</Text>
              <TextInput
                style={[styles.input, errors.plateNumber && styles.inputError]}
                value={formData.plateNumber}
                onChangeText={(value) => handleInputChange('plateNumber', value.toUpperCase())}
                placeholder="e.g., ABC-1234"
                autoCapitalize="characters"
              />
              {errors.plateNumber && (
                <Text style={styles.errorText}>{errors.plateNumber}</Text>
              )}
            </View>

            {/* Engine Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Engine Number *</Text>
              <TextInput
                style={[styles.input, errors.engineNumber && styles.inputError]}
                value={formData.engineNumber}
                onChangeText={(value) => handleInputChange('engineNumber', value.toUpperCase())}
                placeholder="Enter engine number"
                autoCapitalize="characters"
              />
              {errors.engineNumber && (
                <Text style={styles.errorText}>{errors.engineNumber}</Text>
              )}
            </View>

            {/* Chassis Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Chassis Number *</Text>
              <TextInput
                style={[styles.input, errors.chassisNumber && styles.inputError]}
                value={formData.chassisNumber}
                onChangeText={(value) => handleInputChange('chassisNumber', value.toUpperCase())}
                placeholder="Enter chassis number"
                autoCapitalize="characters"
              />
              {errors.chassisNumber && (
                <Text style={styles.errorText}>{errors.chassisNumber}</Text>
              )}
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#58BC6B" />
            <Text style={styles.infoText}>
              All vehicle information will be verified with the relevant authorities. 
              Please ensure all details are accurate and match your vehicle registration documents.
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Review & Submit</Text>
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
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
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
