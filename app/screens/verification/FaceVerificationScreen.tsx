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

interface FaceVerificationScreenProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FaceVerificationScreen: React.FC<FaceVerificationScreenProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { verificationData, updateVerificationData } = useDriverVerification();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Load existing face image if available
    if (verificationData.faceImage) {
      setCapturedImage(verificationData.faceImage);
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
          setCapturedImage(imageUri);
          setShowCamera(false);
          
          // Start face verification process
          await verifyFace(imageUri);
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
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          setCapturedImage(imageUri);
          setShowCamera(false);
          await verifyFace(imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const verifyFace = async (faceImageUri: string) => {
    try {
      setIsVerifying(true);
      
      // Simulate face verification process
      // In a real app, you would use a face recognition service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll always approve if we have both images
      const isMatch = await performFaceMatching(verificationData.licenseImage, faceImageUri);
      
      if (isMatch) {
        updateVerificationData({ 
          faceImage: faceImageUri,
          isFaceVerified: true 
        });
        
        Alert.alert(
          'Face Verification Successful!',
          'Your face matches the photo on your license. Verification approved!',
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('VehicleDetails'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Face Verification Failed',
          'The face in your photo doesn\'t match the photo on your license. Please try again.',
          [
            { text: 'Retake Photo', onPress: retakePicture },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Face verification error:', error);
      Alert.alert('Error', 'Face verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const performFaceMatching = async (licenseImage: string | null, faceImage: string): Promise<boolean> => {
    // This is a simplified face matching function
    // In a real application, you would use a proper face recognition service
    // like AWS Rekognition, Google Vision API, or Azure Face API
    
    if (!licenseImage) {
      return false;
    }

    // For demo purposes, we'll simulate a 90% success rate
    // In reality, you would:
    // 1. Extract face features from both images
    // 2. Compare the features using machine learning algorithms
    // 3. Return true if similarity is above threshold
    
    return Math.random() > 0.1; // 90% success rate for demo
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

  const handleContinue = () => {
    if (capturedImage && verificationData.isFaceVerified) {
      navigation.navigate('VehicleDetails');
    } else {
      Alert.alert('Required', 'Please complete face verification first.');
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
          We need camera access to capture your face for verification. Please enable camera permission in your device settings.
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
        <Text style={styles.headerTitle}>Face Verification</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Verify Your Identity</Text>
        <Text style={styles.instructionsText}>
          Take a clear selfie to verify your identity against your driver's license photo.
        </Text>
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
              {/* Face Frame Guide */}
              <View style={styles.faceFrame}>
                <View style={styles.frameCorner} />
                <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
                <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
                <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
              </View>
              
              {/* Instructions Overlay */}
              <View style={styles.instructionsOverlay}>
                <Text style={styles.overlayText}>Position your face within the frame</Text>
                <Text style={styles.overlaySubtext}>Look directly at the camera</Text>
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
            {isVerifying ? (
              <View style={styles.verifyingOverlay}>
                <ActivityIndicator size="large" color="#58BC6B" />
                <Text style={styles.verifyingText}>Verifying your face...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
                <Ionicons name="camera-outline" size={20} color="#58BC6B" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, (!capturedImage || !verificationData.isFaceVerified) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!capturedImage || !verificationData.isFaceVerified}
        >
          <Text style={styles.continueButtonText}>
            {verificationData.isFaceVerified ? 'Continue' : 'Complete Face Verification'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
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
  faceFrame: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    right: '20%',
    height: '50%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 150,
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
  instructionsOverlay: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlaySubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
    resizeMode: 'cover',
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
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

