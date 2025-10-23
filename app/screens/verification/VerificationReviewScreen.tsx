import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverVerification } from '../../contexts/DriverVerificationContext';
import { useAuth } from '../../contexts/AuthContext';

interface VerificationReviewScreenProps {
  navigation: any;
}

export const VerificationReviewScreen: React.FC<VerificationReviewScreenProps> = ({ navigation }) => {
  const { verificationData, updateVerificationData } = useDriverVerification();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditLicense = () => {
    navigation.navigate('LicenseCapture');
  };

  const handleEditLicenseDetails = () => {
    navigation.navigate('LicenseDetails');
  };

  const handleEditVehicleDetails = () => {
    navigation.navigate('VehicleDetails');
  };

  const handleSubmitVerification = async () => {
    Alert.alert(
      'Submit Verification',
      'Are you sure you want to submit your driver verification? You won\'t be able to edit this information after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          style: 'default',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              
              // Update verification status to submitted
              updateVerificationData({
                verificationStatus: 'approved',
                submittedAt: new Date().toISOString(),
              });

              // Here you would typically send the data to your backend
              // For now, we'll simulate a successful submission
              await new Promise(resolve => setTimeout(resolve, 2000));

              Alert.alert(
                'Verification Submitted',
                'Your driver verification has been submitted successfully. You will receive a notification once it\'s reviewed.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to main tabs (driver will see their dashboard)
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error submitting verification:', error);
              Alert.alert('Error', 'Failed to submit verification. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('AuthOptions');
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Submit</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Review Your Information</Text>
          <Text style={styles.instructionsText}>
            Please review all the information below before submitting your driver verification. 
            Make sure all details are accurate and complete.
          </Text>
        </View>

        {/* License Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Driver's License</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditLicense}>
              <Ionicons name="create-outline" size={16} color="#58BC6B" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.licensePreview}>
            {verificationData.licenseImage ? (
              <Image source={{ uri: verificationData.licenseImage }} style={styles.licenseImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="document-text" size={40} color="#9CA3AF" />
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>License Number:</Text>
              <Text style={styles.detailValue}>{verificationData.licenseNumber || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expiry Date:</Text>
              <Text style={styles.detailValue}>
                {verificationData.licenseExpiry ? formatDate(verificationData.licenseExpiry) : 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditVehicleDetails}>
              <Ionicons name="create-outline" size={16} color="#58BC6B" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Make & Model:</Text>
              <Text style={styles.detailValue}>
                {verificationData.vehicleDetails.make} {verificationData.vehicleDetails.model}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Year:</Text>
              <Text style={styles.detailValue}>{verificationData.vehicleDetails.year || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color:</Text>
              <Text style={styles.detailValue}>{verificationData.vehicleDetails.color || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plate Number:</Text>
              <Text style={styles.detailValue}>{verificationData.vehicleDetails.plateNumber || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Engine Number:</Text>
              <Text style={styles.detailValue}>{verificationData.vehicleDetails.engineNumber || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chassis Number:</Text>
              <Text style={styles.detailValue}>{verificationData.vehicleDetails.chassisNumber || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <View style={styles.termsHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#58BC6B" />
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
          </View>
          <Text style={styles.termsText}>
            By submitting this verification, you agree that:
            {'\n'}• All information provided is accurate and truthful
            {'\n'}• You will be held responsible for any false information
            {'\n'}• Your verification may take 1-3 business days to process
            {'\n'}• You will be notified of the verification status via email
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitVerification}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Verification</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </>
          )}
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
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#58BC6B',
    fontWeight: '500',
  },
  licensePreview: {
    padding: 16,
    alignItems: 'center',
  },
  licenseImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 200,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  termsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#58BC6B',
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termsTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  termsText: {
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
  submitButton: {
    backgroundColor: '#58BC6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
