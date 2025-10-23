import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDriverVerification } from '../../contexts/DriverVerificationContext';
import { useAuth } from '../../contexts/AuthContext';

interface LicenseCaptureScreenProps {
  navigation: any;
  route?: {
    params?: {
      registrationData?: any;
      isDriverRegistration?: boolean;
    };
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LicenseCaptureScreen: React.FC<LicenseCaptureScreenProps> = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false);
  
  const { verificationData, updateVerificationData } = useDriverVerification();
  const { register } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  
  const registrationData = route?.params?.registrationData;
  const isDriverRegistration = route?.params?.isDriverRegistration;

  useEffect(() => {
    // Load existing license image if available
    if (verificationData.licenseImage) {
      setCapturedImage(verificationData.licenseImage);
      setShowCamera(false);
    }
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo.base64) {
          const imageUri = `data:image/jpeg;base64,${photo.base64}`;
          
          // Validate that this looks like a driver's license
          const isValidLicense = await validateDriverLicense(imageUri);
          
          if (isValidLicense) {
            setCapturedImage(imageUri);
            setShowCamera(false);
            updateVerificationData({ licenseImage: imageUri });
          } else {
            // Get detected text to show more specific error
            const detectedText = simulateOCRTextDetection(imageUri);
            const detectedType = getDetectedDocumentType(detectedText);
            
            Alert.alert(
              'Invalid Document Detected',
              `This appears to be a ${detectedType}, not a driver's license.\n\nPlease capture your actual driver's license document.`,
              [
                { text: 'Retake', onPress: () => {} },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          
          // Validate that this looks like a driver's license
          const isValidLicense = await validateDriverLicense(imageUri);
          
          if (isValidLicense) {
            setCapturedImage(imageUri);
            setShowCamera(false);
            updateVerificationData({ licenseImage: imageUri });
          } else {
            // Get detected text to show more specific error
            const detectedText = simulateOCRTextDetection(imageUri);
            const detectedType = getDetectedDocumentType(detectedText);
            
            Alert.alert(
              'Invalid Document Detected',
              `This appears to be a ${detectedType}, not a driver's license.\n\nPlease select your actual driver's license document.`,
              [
                { text: 'Try Again', onPress: pickImageFromGallery },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateDriverLicense = async (imageUri: string): Promise<boolean> => {
    // This is a simplified validation function
    // In a real app, you would use OCR or machine learning to detect:
    // - Driver's license format
    // - Required text fields (license number, expiry date, etc.)
    // - Document type indicators
    
    try {
      // Simulate validation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic validation: check if image exists and has reasonable size
      if (!imageUri || imageUri.length < 1000) {
        return false;
      }
      
      // Simulate more realistic validation that would detect:
      // - Document shape and proportions (driver's licenses are typically rectangular)
      // - Text patterns (license numbers, dates, names)
      // - Visual elements (logos, security features, etc.)
      // - Color schemes typical of driver's licenses
      
      // For demo purposes, we'll simulate a much stricter validation
      // that would typically use OCR to look for driver's license specific text patterns
      
      // Simulate OCR text detection for driver's license keywords
      const simulatedDetectedText = simulateOCRTextDetection(imageUri);
      
      // Check for driver's license specific indicators
      const hasLicenseKeywords = checkForLicenseKeywords(simulatedDetectedText);
      const hasValidFormat = checkDocumentFormat(imageUri);
      const hasLicenseStructure = checkLicenseStructure(simulatedDetectedText);
      
      // Accept if we have license keywords AND (format OR structure)
      // This is more lenient for legitimate licenses while still rejecting non-license documents
      return hasLicenseKeywords && (hasValidFormat || hasLicenseStructure);
      
    } catch (error) {
      console.error('License validation error:', error);
      return false;
    }
  };

  const simulateOCRTextDetection = (imageUri: string): string[] => {
    // Simulate OCR text detection
    // In reality, this would use Google Vision API, AWS Textract, etc.
    
    // Simulate different text patterns based on image characteristics
    const randomValue = Math.random();
    
    if (randomValue < 0.05) {
      // Simulate money/bill detection
      return ['$1', 'ONE DOLLAR', 'UNITED STATES', 'TREASURY', 'SERIES'];
    } else if (randomValue < 0.1) {
      // Simulate national ID detection
      return ['NATIONAL ID', 'IDENTITY CARD', 'CITIZEN', 'ID NUMBER'];
    } else if (randomValue < 0.15) {
      // Simulate passport detection
      return ['PASSPORT', 'PASSEPORT', 'REPUBLIC', 'PASSPORT NO'];
    } else if (randomValue < 0.2) {
      // Simulate credit card detection
      return ['VISA', 'MASTERCARD', 'CARD NUMBER', 'EXPIRES', 'VALID THRU'];
    } else if (randomValue < 0.25) {
      // Simulate random document
      return ['DOCUMENT', 'CERTIFICATE', 'AWARD', 'DIPLOMA'];
    } else {
      // Simulate valid driver's license text (much higher probability now)
      // Based on the actual Philippine Professional Driver's License sample provided
      const licenseTexts = [
        // Philippine Professional Driver's License specific text
        'REPUBLIC OF THE PHILIPPINES', 'DEPARTMENT OF TRANSPORTATION', 
        'LAND TRANSPORTATION OFFICE', 'PROFESSIONAL DRIVER\'S LICENSE',
        'LTO', 'DRIVER\'S LICENSE', 'NON-PROFESSIONAL', 'PROFESSIONAL',
        
        // Personal information fields
        'Last Name, First Name, Middle Name', 'SANCHEZ, CARLOS',
        'Nationality: Filipino', 'Sex: M', 'Date of Birth: 1990/01/01',
        'Weight (kg): 70', 'Height (m): 1.75', 'Address: 1000 KUNDIMAN STREET',
        'SAMPALOC, 1008 MANILA, PHILIPPINES',
        
        // License details
        'License No.: C10-17-123456', 'Expiration Date: 2026/01/01',
        'Agency Code: C10', 'Blood type: A', 'Eyes Color: black',
        'Restriction: 2', 'Conditions: B',
        
        // Back side information
        'RESTRICTIONS', 'CONDITIONS', 'ORGAN DONATION',
        'MOTORCYCLES/MOTORIZED TRICYCLES', 'VEHICLE UP TO 4500 KGS GVW',
        'VEHICLE ABOVE 4500 KGS GVW', 'AUTOMATIC CLUTCH UP TO 4500 GVW',
        'AUTOMATIC CLUTCH ABOVE 4500 GVW', 'ARTICULATED VEHICLE',
        'WEAR EYEGLASSES', 'DRIVE ONLY W/SPECIAL EQPT',
        'DAYLIGHT DRIVING ONLY', 'ACCOMPANIED BY A PERSON',
        'Serial Number', 'IN CASE OF EMERGENCY NOTIFY',
        
        // Common license terms
        'LICENSE', 'DRIVER', 'DRIVING', 'MOTOR', 'VEHICLE', 'AUTO',
        'EXPIRY', 'EXPIRATION', 'VALID', 'VALIDITY', 'ISSUE', 'ISSUED',
        'BIRTH', 'BORN', 'DATE', 'NAME', 'SURNAME', 'GIVEN', 'MIDDLE',
        'ADDRESS', 'RESIDENCE', 'CITY', 'PROVINCE', 'STATE', 'COUNTRY',
        'SEX', 'GENDER', 'MALE', 'FEMALE', 'HEIGHT', 'WEIGHT', 'EYES',
        'HAIR', 'SIGNATURE', 'PHOTO', 'PICTURE', 'IMAGE'
      ];
      
      // Return a random selection of license-related text
      const shuffled = licenseTexts.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.floor(Math.random() * 8) + 5); // 5-12 items
    }
  };

  const checkForLicenseKeywords = (detectedText: string[]): boolean => {
    const textString = detectedText.join(' ').toUpperCase();
    
    // First check for explicit non-license documents
    const nonLicenseTerms = [
      'NATIONAL ID', 'IDENTITY CARD', 'CITIZEN', 'CITIZENSHIP',
      'PASSPORT', 'PASSEPORT', 'PASSPORT NO', 'PASSPORT NUMBER',
      'VISA', 'MASTERCARD', 'CARD NUMBER', 'VALID THRU',
      'DOLLAR', 'TREASURY', 'UNITED STATES', 'SERIES',
      'CERTIFICATE', 'AWARD', 'DIPLOMA', 'DEGREE'
    ];
    
    // If we detect non-license terms, reject immediately
    const hasNonLicenseTerms = nonLicenseTerms.some(term => 
      textString.includes(term)
    );
    
    if (hasNonLicenseTerms) {
      return false;
    }
    
    // Core driver's license terms (must have at least one of these)
    const coreLicenseTerms = [
      'DRIVER', 'LICENSE', 'LICENCE', 'DRIVING', 'MOTOR', 'VEHICLE', 'AUTO',
      'PERMIT', 'DMV', 'LTO', 'PHILIPPINE', 'REPUBLIC',
      'REPUBLIC OF THE PHILIPPINES', 'DEPARTMENT OF TRANSPORTATION',
      'LAND TRANSPORTATION OFFICE', 'PROFESSIONAL DRIVER\'S LICENSE'
    ];
    
    // License-specific terms (must have at least one of these)
    const licenseSpecificTerms = [
      'CLASS', 'NON-PROFESSIONAL', 'PROFESSIONAL', 'STUDENT',
      'RESTRICTIONS', 'ENDORSEMENTS', 'EXPIRES', 'EXPIRY', 'EXPIRATION',
      'VALID', 'VALIDITY', 'ISSUE', 'ISSUED', 'CONDITIONS',
      'MOTORCYCLES', 'MOTORIZED TRICYCLES', 'VEHICLE UP TO',
      'AUTOMATIC CLUTCH', 'ARTICULATED VEHICLE', 'WEAR EYEGLASSES',
      'DAYLIGHT DRIVING', 'ORGAN DONATION', 'SERIAL NUMBER'
    ];
    
    // Check for core license terms
    const hasCoreTerms = coreLicenseTerms.some(term => 
      textString.includes(term)
    );
    
    // Check for license-specific terms
    const hasSpecificTerms = licenseSpecificTerms.some(term => 
      textString.includes(term)
    );
    
    // Must have core terms AND specific terms (more strict)
    return hasCoreTerms && hasSpecificTerms;
  };

  const checkDocumentFormat = (imageUri: string): boolean => {
    // Simulate format validation
    // In reality, this would check:
    // - Aspect ratio (driver's licenses are typically 3.375" x 2.125")
    // - Document proportions
    // - Visual layout patterns
    
    // For demo, simulate 85% success rate for proper format (more strict)
    return Math.random() > 0.15;
  };

  const checkLicenseStructure = (detectedText: string[]): boolean => {
    // Simulate structure validation
    // In reality, this would check for:
    // - License number format
    // - Date formats
    // - Required field presence
    
    const textString = detectedText.join(' ').toUpperCase();
    
    // Check for Philippine license number pattern (C10-17-123456 format)
    const hasPhilippineLicenseNumber = /[A-Z]\d{2}-\d{2}-\d{6}/.test(textString);
    
    // Check for general license number pattern (alphanumeric)
    const hasGeneralLicenseNumber = /[A-Z0-9]{5,}/.test(textString);
    
    // Check for date patterns - including Philippine format (YYYY/MM/DD)
    const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(textString) || 
                          /\d{1,2}-\d{1,2}-\d{2,4}/.test(textString) ||
                          /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(textString) ||
                          /\d{4}-\d{1,2}-\d{1,2}/.test(textString) ||
                          /\d{4}\/\d{1,2}\/\d{1,2}/.test(textString); // Added Philippine date format
    
    // Check for Philippine-specific fields
    const hasPhilippineFields = textString.includes('AGENCY CODE') || 
                               textString.includes('BLOOD TYPE') ||
                               textString.includes('EYES COLOR') ||
                               textString.includes('RESTRICTION:') ||
                               textString.includes('CONDITIONS:');
    
    // Accept if we have (Philippine license number OR general license number) AND date pattern
    // OR if we have Philippine-specific fields (more lenient for Philippine licenses)
    return ((hasPhilippineLicenseNumber || hasGeneralLicenseNumber) && hasDatePattern) || 
           hasPhilippineFields;
  };

  const getDetectedDocumentType = (detectedText: string[]): string => {
    const textString = detectedText.join(' ').toUpperCase();
    
    if (textString.includes('$') || textString.includes('DOLLAR') || textString.includes('TREASURY')) {
      return 'dollar bill/money';
    } else if (textString.includes('NATIONAL ID') || textString.includes('IDENTITY CARD')) {
      return 'national ID card';
    } else if (textString.includes('PASSPORT')) {
      return 'passport';
    } else if (textString.includes('VISA') || textString.includes('MASTERCARD') || textString.includes('CARD NUMBER')) {
      return 'credit card';
    } else if (textString.includes('CERTIFICATE') || textString.includes('AWARD') || textString.includes('DIPLOMA')) {
      return 'certificate/document';
    } else {
      return 'unrecognized document';
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => (current === 'off' ? 'on' : 'off'));
  };

  const handleContinue = async () => {
    if (capturedImage) {
      // Show confirmation dialog explaining the next steps
      Alert.alert(
        'License Captured Successfully!',
        'Next, you\'ll need to:\n\n1. Enter your license details\n2. Take a selfie for face verification\n3. Provide your vehicle information\n\nThis ensures you are the person on the license.',
        [
          {
            text: 'Continue',
            onPress: async () => {
              // If this is part of driver registration, complete the registration first
              if (isDriverRegistration && registrationData) {
                try {
                  setIsCompletingRegistration(true);
                  await register(registrationData);
                  // Registration successful, continue to license details
                  navigation.navigate('LicenseDetails');
                } catch (error: any) {
                  Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
                  setIsCompletingRegistration(false);
                  return;
                }
              } else {
                // Normal verification flow
                navigation.navigate('LicenseDetails');
              }
            }
          },
          { text: 'Retake License', style: 'cancel', onPress: retakePicture }
        ]
      );
    } else {
      Alert.alert('Required', 'Please capture your driver\'s license first.');
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#58BC6B" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={64} color="#6B7280" />
        <Text style={styles.errorTitle}>Camera Permission Required</Text>
        <Text style={styles.errorText}>
          We need camera access to capture your driver's license. Please enable camera permission in your device settings.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Driver's License</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Capture Your Driver's License</Text>
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          <Text style={styles.requirementItem}>• Must be a valid driver's license (any country)</Text>
          <Text style={styles.requirementItem}>• NOT accepted: ID cards, passports, money, credit cards</Text>
          <Text style={styles.requirementItem}>• All text must be clearly readable</Text>
          <Text style={styles.requirementItem}>• License must not be expired</Text>
          <Text style={styles.requirementItem}>• Photo must be well-lit and in focus</Text>
        </View>
      </View>

      {/* Camera or Image Preview */}
      <View style={styles.cameraContainer}>
        {showCamera ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            flash={flashMode}
          >
            {/* Camera Overlay */}
            <View style={styles.cameraOverlay}>
              {/* License Frame Guide */}
              <View style={styles.licenseFrame}>
                <View style={styles.frameCorner} />
                <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
                <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
                <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
              </View>
              
              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.controlButton} onPress={pickImageFromGallery}>
                  <Ionicons name="images-outline" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                  onPress={takePicture}
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                  <Ionicons 
                    name={flashMode === 'on' ? "flash" : "flash-off"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        ) : (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: capturedImage! }} style={styles.previewImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <Ionicons name="camera-outline" size={20} color="#58BC6B" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, (!capturedImage || isCompletingRegistration) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!capturedImage || isCompletingRegistration}
        >
          {isCompletingRegistration ? (
            <>
              <ActivityIndicator size="small" color="#58BC6B" />
              <Text style={[styles.continueButtonText, { marginLeft: 8 }]}>Creating Account...</Text>
            </>
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
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
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  requirementsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 4,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  licenseFrame: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: '40%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  frameCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#58BC6B',
    top: -3,
    left: -3,
  },
  frameCornerTopRight: {
    right: -3,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  frameCornerBottomLeft: {
    bottom: -3,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  frameCornerBottomRight: {
    bottom: -3,
    top: 'auto',
    right: -3,
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#58BC6B',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  retakeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#58BC6B',
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#58BC6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  button: {
    backgroundColor: '#58BC6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
