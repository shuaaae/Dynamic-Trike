// Database types for Dynamic Trike app
export interface User {
  id: string;
  email: string;
  emailVisibility?: boolean;
  verified: boolean;
  name: string;
  username: string;
  avatar?: string;
  role: 'passenger' | 'driver' | 'admin';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  user: string; // User ID
  verified: boolean;
  vehicle_no?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  passenger: string; // User ID
  driver?: string; // Driver ID
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  dinstanceKm?: number;
  fuelPrice?: number;
  fare?: number;
  status?: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelPrice {
  id: string;
  price?: number;
  source?: string;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'passenger' | 'driver' | 'admin';
  phone?: string;
  avatar?: string;
  verified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  username?: string; // Made optional since we removed it from the form
  role: 'passenger' | 'driver';
  phone?: string;
}

// Trip creation types
export interface CreateTripData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  dinstanceKm?: number;
  fuelPrice?: number;
  fare?: number;
}

// Driver profile types
export interface CreateDriverData {
  vehicle_no: string;
}
