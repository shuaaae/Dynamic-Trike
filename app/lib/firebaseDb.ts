import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';
import { 
  Trip, 
  Driver, 
  FuelPrice, 
  CreateTripData, 
  CreateDriverData 
} from '../types/database';

// Trip API functions
export const tripApi = {
  // Get all trips for current user
  getMyTrips: async (): Promise<Trip[]> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const tripsRef = collection(db, 'trips');
      const q = query(
        tripsRef,
        where('passenger', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const trips: Trip[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          startedAt: data.startedAt?.toDate?.()?.toISOString() || data.startedAt,
          endedAt: data.endedAt?.toDate?.()?.toISOString() || data.endedAt,
        } as Trip);
      });
      
      return trips;
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      throw error;
    }
  },

  // Get trip by ID
  getTrip: async (id: string): Promise<Trip> => {
    try {
      const tripRef = doc(db, 'trips', id);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const data = tripSnap.data();
      return {
        id: tripSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        startedAt: data.startedAt?.toDate?.()?.toISOString() || data.startedAt,
        endedAt: data.endedAt?.toDate?.()?.toISOString() || data.endedAt,
      } as Trip;
    } catch (error) {
      console.error('Failed to fetch trip:', error);
      throw error;
    }
  },

  // Create new trip
  createTrip: async (data: CreateTripData): Promise<Trip> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const tripData = {
        ...data,
        passenger: currentUser.uid,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'trips'), tripData);
      
      return {
        id: docRef.id,
        ...tripData,
        createdAt: tripData.createdAt.toDate().toISOString(),
        updatedAt: tripData.updatedAt.toDate().toISOString(),
      } as Trip;
    } catch (error) {
      console.error('Failed to create trip:', error);
      throw error;
    }
  },

  // Update trip
  updateTrip: async (id: string, data: Partial<Trip>): Promise<Trip> => {
    try {
      const tripRef = doc(db, 'trips', id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(tripRef, updateData);
      
      // Return updated trip
      return await tripApi.getTrip(id);
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  },

  // Cancel trip
  cancelTrip: async (id: string): Promise<Trip> => {
    try {
      return await tripApi.updateTrip(id, { status: 'cancelled' });
    } catch (error) {
      console.error('Failed to cancel trip:', error);
      throw error;
    }
  },

  // Start trip (for drivers)
  startTrip: async (id: string): Promise<Trip> => {
    try {
      return await tripApi.updateTrip(id, {
        status: 'ongoing',
        startedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to start trip:', error);
      throw error;
    }
  },

  // Complete trip (for drivers)
  completeTrip: async (id: string): Promise<Trip> => {
    try {
      return await tripApi.updateTrip(id, {
        status: 'completed',
        endedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to complete trip:', error);
      throw error;
    }
  }
};

// Driver API functions
export const driverApi = {
  // Get current user's driver profile
  getMyDriverProfile: async (): Promise<Driver | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const driversRef = collection(db, 'drivers');
      const q = query(driversRef, where('user', '==', currentUser.uid));
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Driver;
    } catch (error) {
      console.error('Failed to fetch driver profile:', error);
      throw error;
    }
  },

  // Create driver profile
  createDriverProfile: async (data: CreateDriverData): Promise<Driver> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const driverData = {
        ...data,
        user: currentUser.uid,
        verified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'drivers'), driverData);
      
      return {
        id: docRef.id,
        ...driverData,
        createdAt: driverData.createdAt.toDate().toISOString(),
        updatedAt: driverData.updatedAt.toDate().toISOString(),
      } as Driver;
    } catch (error) {
      console.error('Failed to create driver profile:', error);
      throw error;
    }
  },

  // Update driver profile
  updateDriverProfile: async (id: string, data: Partial<Driver>): Promise<Driver> => {
    try {
      const driverRef = doc(db, 'drivers', id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(driverRef, updateData);
      
      // Return updated driver
      const driverSnap = await getDoc(driverRef);
      const driverData = driverSnap.data();
      
      return {
        id: driverSnap.id,
        ...driverData,
        createdAt: driverData?.createdAt?.toDate?.()?.toISOString() || driverData?.createdAt,
        updatedAt: driverData?.updatedAt?.toDate?.()?.toISOString() || driverData?.updatedAt,
      } as Driver;
    } catch (error) {
      console.error('Failed to update driver profile:', error);
      throw error;
    }
  },

  // Get available trips for drivers
  getAvailableTrips: async (): Promise<Trip[]> => {
    try {
      const tripsRef = collection(db, 'trips');
      const q = query(
        tripsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const trips: Trip[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          startedAt: data.startedAt?.toDate?.()?.toISOString() || data.startedAt,
          endedAt: data.endedAt?.toDate?.()?.toISOString() || data.endedAt,
        } as Trip);
      });
      
      return trips;
    } catch (error) {
      console.error('Failed to fetch available trips:', error);
      throw error;
    }
  },

  // Accept trip (assign driver to trip)
  acceptTrip: async (tripId: string): Promise<Trip> => {
    try {
      const driverProfile = await driverApi.getMyDriverProfile();
      if (!driverProfile) {
        throw new Error('Driver profile not found');
      }

      return await tripApi.updateTrip(tripId, {
        driver: driverProfile.id
      });
    } catch (error) {
      console.error('Failed to accept trip:', error);
      throw error;
    }
  }
};

// Fuel Price API functions
export const fuelPriceApi = {
  // Get current fuel price
  getCurrentFuelPrice: async (): Promise<FuelPrice | null> => {
    try {
      const fuelPricesRef = collection(db, 'fuel_prices');
      const q = query(
        fuelPricesRef,
        orderBy('effectiveAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        effectiveAt: data.effectiveAt?.toDate?.()?.toISOString() || data.effectiveAt,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as FuelPrice;
    } catch (error) {
      console.error('Failed to fetch fuel price:', error);
      throw error;
    }
  },

  // Get all fuel prices (admin only)
  getAllFuelPrices: async (): Promise<FuelPrice[]> => {
    try {
      const fuelPricesRef = collection(db, 'fuel_prices');
      const q = query(fuelPricesRef, orderBy('effectiveAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const prices: FuelPrice[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        prices.push({
          id: doc.id,
          ...data,
          effectiveAt: data.effectiveAt?.toDate?.()?.toISOString() || data.effectiveAt,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as FuelPrice);
      });
      
      return prices;
    } catch (error) {
      console.error('Failed to fetch fuel prices:', error);
      throw error;
    }
  }
};

// Utility functions (same as before)
export const calculateFare = (distanceKm: number, fuelPrice: number): number => {
  // Simple fare calculation: base fare + (distance * rate per km)
  const baseFare = 50; // Base fare in local currency
  const ratePerKm = fuelPrice * 0.1; // 10% of fuel price per km
  return baseFare + (distanceKm * ratePerKm);
};

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
