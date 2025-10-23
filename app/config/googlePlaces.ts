// Google Places API Configuration
// Replace with your actual Google Places API key

export const GOOGLE_PLACES_CONFIG = {
  // Get your API key from: https://console.cloud.google.com/apis/credentials
  // Replace this with your actual Google Places API key
  API_KEY: 'AIzaSyBDj8SppH0pRe0t8xfsUNDJMAagZMVwfCE',
  
  // Geocoding API key for address conversion
  GEOCODING_API_KEY: 'AIzaSyBdkzzIGQY2AYKzOfV3lkPmavX9-jr1fIM',
  
  // API endpoints - Updated to use new Places API
  TEXT_SEARCH_URL: 'https://places.googleapis.com/v1/places:searchText',
  DETAILS_URL: 'https://places.googleapis.com/v1/places',
  GEOCODING_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
  
  // Search parameters
  DEFAULT_REGION: 'ph', // Philippines
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_RADIUS: 50000, // 50km in meters
  MAX_RESULTS: 20,
};

// Instructions for setting up Google Places API:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable "Places API" and "Geocoding API"
// 4. Go to "Credentials" and create an API key
// 5. Restrict the API key to your app's bundle ID
// 6. Replace 'YOUR_GOOGLE_PLACES_API_KEY_HERE' with your actual API key
// 7. For production, store the API key in environment variables

export default GOOGLE_PLACES_CONFIG;
