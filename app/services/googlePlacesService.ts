// Google Places API Service
import { GOOGLE_PLACES_CONFIG } from '../config/googlePlaces';

const GOOGLE_PLACES_API_KEY = GOOGLE_PLACES_CONFIG.API_KEY;

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  distance?: string;
  latitude: number;
  longitude: number;
  placeId: string;
  types?: string[];
  businessStatus?: string;
  priceLevel?: number;
  rating?: number;
  userRatingCount?: number;
  phoneNumber?: string;
  websiteUri?: string;
  addressComponents?: {
    purok?: string;
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    region?: string;
    postalCode?: string;
    zone?: string;
    country?: string;
    route?: string;
    streetNumber?: string;
  };
}

export interface SearchPlacesResponse {
  results: PlaceResult[];
  status: string;
}

export const searchPlaces = async (query: string, userLocation?: { latitude: number; longitude: number }): Promise<PlaceResult[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    // Check if API key is configured
    if (GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY_HERE' || !GOOGLE_PLACES_API_KEY) {
      throw new Error('API_KEY_NOT_CONFIGURED');
    }

    // Google Places API (New) - Text Search
    const requestBody: any = {
      textQuery: query,
      languageCode: GOOGLE_PLACES_CONFIG.DEFAULT_LANGUAGE,
      regionCode: GOOGLE_PLACES_CONFIG.DEFAULT_REGION,
      maxResultCount: Math.min(GOOGLE_PLACES_CONFIG.MAX_RESULTS, 20), // Limit to 20 as per API
    };

    // Add location bias if user location is available
    if (userLocation) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          radius: GOOGLE_PLACES_CONFIG.DEFAULT_RADIUS,
        },
      };
    }

    const response = await fetch(`${GOOGLE_PLACES_CONFIG.TEXT_SEARCH_URL}?key=${GOOGLE_PLACES_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.id,places.types,places.addressComponents',
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();

    // Check for errors in the new API format
    if (data.error) {
      console.error('Google Places API Error:', data.error);
      if (data.error.code === 403) {
        throw new Error('API_KEY_INVALID');
      } else if (data.error.code === 429) {
        throw new Error('QUOTA_EXCEEDED');
      } else if (data.error.code === 400) {
        throw new Error(`API_ERROR_400: ${data.error.message || 'Bad Request'}`);
      } else {
        throw new Error(`API_ERROR_${data.error.code}: ${data.error.message || 'Unknown error'}`);
      }
    }

    // Transform Google Places results to our format (new API structure)
    const results: PlaceResult[] = (data.places || []).map((place: any, index: number) => {
      // Calculate distance if user location is available
      let distance = '';
      if (userLocation && place.location) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.location.latitude,
          place.location.longitude
        );
        distance = `${dist.toFixed(2)}km`;
      }

      // Parse address components for detailed Philippine address
      const addressComponents = parseAddressComponents(place.addressComponents);
      const formattedAddress = formatPhilippineAddress(place);

      return {
        id: place.id || `place_${index}`,
        name: place.displayName?.text || 'Unknown Place',
        address: formattedAddress,
        distance,
        latitude: place.location?.latitude || 0,
        longitude: place.location?.longitude || 0,
        placeId: place.id || '',
        types: place.types || [],
        businessStatus: place.businessStatus || 'OPERATIONAL', // Default to operational
        priceLevel: place.priceLevel || undefined,
        rating: place.rating || undefined,
        userRatingCount: place.userRatingCount || undefined,
        phoneNumber: place.phoneNumber || undefined,
        websiteUri: place.websiteUri || undefined,
        addressComponents: addressComponents,
      };
    });

    return results;
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Parse address components for Philippine addresses
const parseAddressComponents = (addressComponents: any[]): any => {
  const components: any = {};
  
  if (!addressComponents) return components;
  
  addressComponents.forEach((component: any) => {
    const types = component.types || [];
    const longName = component.longName || '';
    const shortName = component.shortName || '';
    
    // Map Google address components to Philippine structure with more detail
    if (types.includes('subpremise')) {
      components.purok = longName;
    } else if (types.includes('premise')) {
      components.street = longName;
    } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
      components.barangay = longName;
    } else if (types.includes('sublocality_level_2')) {
      components.zone = longName; // For zone information
    } else if (types.includes('locality')) {
      components.city = longName;
    } else if (types.includes('administrative_area_level_1')) {
      components.province = longName;
    } else if (types.includes('administrative_area_level_2')) {
      components.region = longName;
    } else if (types.includes('postal_code')) {
      components.postalCode = longName;
    } else if (types.includes('country')) {
      components.country = longName;
    } else if (types.includes('route')) {
      components.route = longName; // Street/road name
    } else if (types.includes('street_number')) {
      components.streetNumber = longName; // House/building number
    }
  });
  
  return components;
};

// Format address with detailed Philippine structure
const formatPhilippineAddress = (place: any): string => {
  const addressComponents = parseAddressComponents(place.addressComponents);
  
  // Use the full formatted address from Google for maximum detail
  // This includes zone information, barangay details, postal codes, etc.
  if (place.formattedAddress) {
    return place.formattedAddress;
  }
  
  // Fallback to building address from components
  const parts: string[] = [];
  
  // Build detailed address: Zone, Purok, Street, Barangay, City, Province, Postal Code, Region, Country
  if (addressComponents.purok) parts.push(addressComponents.purok);
  if (addressComponents.street) parts.push(addressComponents.street);
  if (addressComponents.barangay) parts.push(addressComponents.barangay);
  if (addressComponents.city) parts.push(addressComponents.city);
  if (addressComponents.province) parts.push(addressComponents.province);
  if (addressComponents.postalCode) parts.push(addressComponents.postalCode);
  if (addressComponents.region) parts.push(addressComponents.region);
  parts.push('Philippines');
  
  return parts.length > 1 ? parts.join(', ') : 'Address not available';
};

// Get place details by place ID
export const getPlaceDetails = async (placeId: string): Promise<any> => {
  try {
    const response = await fetch(`${GOOGLE_PLACES_CONFIG.DETAILS_URL}/${placeId}?key=${GOOGLE_PLACES_API_KEY}&fields=displayName,formattedAddress,location,id,types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'displayName,formattedAddress,location,id,types',
      },
    });
    
    const data = await response.json();

    if (data.error) {
      throw new Error(`Google Places Details API error: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

// Fallback search for when Google Places API is not available
export const fallbackSearch = async (query: string): Promise<PlaceResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return some realistic fallback results based on common search terms
  const commonPlaces = [
    'Restaurant', 'Hospital', 'School', 'Bank', 'Gas Station', 'Shopping Mall', 
    'Pharmacy', 'Police Station', 'Fire Station', 'Post Office', 'Library',
    'Park', 'Gym', 'Hotel', 'Airport', 'Bus Station', 'Train Station'
  ];
  
  const matchingPlaces = commonPlaces.filter(place => 
    place.toLowerCase().includes(query.toLowerCase()) || 
    query.toLowerCase().includes(place.toLowerCase())
  );
  
  const fallbackResults: PlaceResult[] = matchingPlaces.slice(0, 5).map((place, index) => ({
    id: `fallback_${index + 1}`,
    name: `${place} near ${query}`,
    address: `Sample address for ${place} - Enable Google Places API for real results`,
    distance: `${Math.floor(Math.random() * 20) + 1}km`,
    latitude: 14.5995 + (Math.random() - 0.5) * 0.1, // Around Manila area
    longitude: 120.9842 + (Math.random() - 0.5) * 0.1,
    placeId: `fallback_${index + 1}`,
  }));

  // If no matches, return generic results
  if (fallbackResults.length === 0) {
    return [
      {
        id: 'fallback1',
        name: `${query} - Location 1`,
        address: 'Sample address - Enable Google Places API for real results',
        distance: '5km',
        latitude: 14.5995,
        longitude: 120.9842,
        placeId: 'fallback1',
      },
      {
        id: 'fallback2',
        name: `${query} - Location 2`,
        address: 'Sample address - Enable Google Places API for real results',
        distance: '8km',
        latitude: 14.6095,
        longitude: 120.9942,
        placeId: 'fallback2',
      },
    ];
  }

  return fallbackResults;
};
