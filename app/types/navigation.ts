import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootTabParamList = {
  Home: undefined;
  DriverDashboard: undefined;
  Activity: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  AuthOptions: undefined;
  Login: undefined;
  MainTabs: undefined;
  Search: undefined;
  Transport: {
    selectedLocation: {
      latitude: number;
      longitude: number;
      address: string;
      fullAddress: string;
    };
    destination?: {
      title: string;
      address: string;
      latitude: number;
      longitude: number;
    };
  };
  MapSelection: {
    isPickupSelection?: boolean;
    destination?: {
      title: string;
      address: string;
      latitude: number;
      longitude: number;
    };
  } | undefined;
  LicenseCapture: {
    registrationData?: any;
    isDriverRegistration?: boolean;
  } | undefined;
  LicenseDetails: undefined;
  FaceVerification: undefined;
  VehicleDetails: undefined;
  VerificationReview: undefined;
  DevSettings: undefined;
};

export type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'> & StackNavigationProp<RootStackParamList>;
export type ActivityScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Activity'>;
export type AccountScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Account'>;
export type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;
