// Google Directions API service for route planning
import { GOOGLE_PLACES_CONFIG } from '../config/googlePlaces';

export interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

export interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

export interface DirectionsResponse {
  coordinates: RouteCoordinates[];
  routeInfo: RouteInfo;
}

// Get directions between two points using Google Routes API (New)
export const getDirections = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<DirectionsResponse> => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    
    // Use the new Routes API endpoint
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
    
    console.log('[Directions] Fetching route from', originStr, 'to', destinationStr);
    
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: "en-US",
      units: "METRIC"
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_CONFIG.API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Routes API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }
    
    const route = data.routes[0];
    
    // Extract coordinates from the polyline
    const coordinates = decodePolyline(route.polyline.encodedPolyline);
    
    // Extract route information
    const routeInfo: RouteInfo = {
      distance: formatDistance(route.distanceMeters),
      duration: formatDuration(route.duration),
      distanceValue: route.distanceMeters,
      durationValue: parseInt(route.duration.replace('s', '')),
    };
    
    console.log('[Directions] Route found:', routeInfo.distance, routeInfo.duration);
    
    return {
      coordinates,
      routeInfo,
    };
  } catch (error) {
    console.error('[Directions] Error fetching directions:', error);
    throw error;
  }
};

// Decode Google's polyline encoding
const decodePolyline = (encoded: string): RouteCoordinates[] => {
  const points: RouteCoordinates[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

// Format distance from meters to readable string
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(1)}km`;
  }
};

// Format duration from seconds to readable string
const formatDuration = (duration: string): string => {
  const seconds = parseInt(duration.replace('s', ''));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

// Calculate bounds to fit both points
export const calculateBounds = (
  pickup: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  const minLat = Math.min(pickup.latitude, destination.latitude);
  const maxLat = Math.max(pickup.latitude, destination.latitude);
  const minLng = Math.min(pickup.longitude, destination.longitude);
  const maxLng = Math.max(pickup.longitude, destination.longitude);
  
  const latDelta = (maxLat - minLat) * 1.2; // Add 20% padding
  const lngDelta = (maxLng - minLng) * 1.2; // Add 20% padding
  
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
    longitudeDelta: Math.max(lngDelta, 0.01), // Minimum zoom level
  };
};
