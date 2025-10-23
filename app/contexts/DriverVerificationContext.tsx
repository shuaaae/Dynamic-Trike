import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver, VehicleDetails } from '../types/database';

export interface DriverVerificationData {
  licenseImage: string | null;
  licenseNumber: string;
  licenseExpiry: string;
  faceImage: string | null;
  vehicleDetails: VehicleDetails;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string | null;
  isFaceVerified: boolean;
}

type DriverVerificationContextType = {
  verificationData: DriverVerificationData;
  updateVerificationData: (data: Partial<DriverVerificationData>) => void;
  clearVerificationData: () => void;
  saveVerificationData: () => Promise<void>;
  loadVerificationData: () => Promise<void>;
  isVerificationComplete: boolean;
  canSubmitVerification: boolean;
};

const defaultVerificationData: DriverVerificationData = {
  licenseImage: null,
  licenseNumber: '',
  licenseExpiry: '',
  faceImage: null,
  vehicleDetails: {
    make: '',
    model: '',
    year: undefined,
    color: '',
    plateNumber: '',
    engineNumber: '',
    chassisNumber: '',
  },
  verificationStatus: 'pending',
  submittedAt: null,
  isFaceVerified: false,
};

const DriverVerificationContext = createContext<DriverVerificationContextType>({} as DriverVerificationContextType);

export const DriverVerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verificationData, setVerificationData] = useState<DriverVerificationData>(defaultVerificationData);

  const updateVerificationData = (data: Partial<DriverVerificationData>) => {
    setVerificationData(prev => ({
      ...prev,
      ...data,
      vehicleDetails: {
        ...prev.vehicleDetails,
        ...data.vehicleDetails,
      },
    }));
  };

  const clearVerificationData = () => {
    setVerificationData(defaultVerificationData);
    AsyncStorage.removeItem('driver_verification_data');
  };

  const saveVerificationData = async () => {
    try {
      await AsyncStorage.setItem('driver_verification_data', JSON.stringify(verificationData));
      console.log('[DriverVerification] Data saved successfully');
    } catch (error) {
      console.error('[DriverVerification] Failed to save data:', error);
    }
  };

  const loadVerificationData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('driver_verification_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setVerificationData(parsedData);
        console.log('[DriverVerification] Data loaded successfully');
      }
    } catch (error) {
      console.error('[DriverVerification] Failed to load data:', error);
    }
  };

  const isVerificationComplete = Boolean(
    verificationData.licenseImage &&
    verificationData.licenseNumber &&
    verificationData.licenseExpiry &&
    verificationData.faceImage &&
    verificationData.vehicleDetails.make &&
    verificationData.vehicleDetails.model &&
    verificationData.vehicleDetails.year &&
    verificationData.vehicleDetails.color &&
    verificationData.vehicleDetails.plateNumber
  );

  const canSubmitVerification = isVerificationComplete && verificationData.verificationStatus === 'pending';

  // Auto-approve verification when all data is complete
  const autoApproveVerification = () => {
    if (isVerificationComplete && verificationData.verificationStatus === 'pending') {
      updateVerificationData({
        verificationStatus: 'approved',
        submittedAt: new Date().toISOString(),
        isFaceVerified: true,
      });
    }
  };

  // Auto-save when verification data changes
  useEffect(() => {
    if (verificationData !== defaultVerificationData) {
      saveVerificationData();
    }
  }, [verificationData]);

  // Auto-approve when verification is complete
  useEffect(() => {
    autoApproveVerification();
  }, [isVerificationComplete]);

  const value: DriverVerificationContextType = {
    verificationData,
    updateVerificationData,
    clearVerificationData,
    saveVerificationData,
    loadVerificationData,
    isVerificationComplete,
    canSubmitVerification,
  };

  return (
    <DriverVerificationContext.Provider value={value}>
      {children}
    </DriverVerificationContext.Provider>
  );
};

export const useDriverVerification = () => {
  const context = useContext(DriverVerificationContext);
  if (!context) {
    throw new Error('useDriverVerification must be used within a DriverVerificationProvider');
  }
  return context;
};
