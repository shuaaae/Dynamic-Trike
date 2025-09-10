import { 
  tripApi,
  driverApi,
  fuelPriceApi,
  calculateFare,
  calculateDistance
} from '../lib/firebaseDb';
import { 
  Trip, 
  Driver, 
  FuelPrice, 
  CreateTripData, 
  CreateDriverData,
  ApiResponse 
} from '../types/database';

// Re-export Firebase API functions
export { tripApi, driverApi, fuelPriceApi, calculateFare, calculateDistance };

