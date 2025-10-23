import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  PanResponder,
  Image,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import PulsatingMarker from '../components/PulsatingMarker';

const { width, height } = Dimensions.get('window');

type MapSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapSelection'>;
type MapSelectionScreenRouteProp = RouteProp<RootStackParamList, 'MapSelection'>;

interface Props {
  navigation: MapSelectionScreenNavigationProp;
  route: MapSelectionScreenRouteProp;
}

const MapSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    fullAddress: string;
  }>({
    latitude: 12.8797, // Default Philippines center
    longitude: 121.7740,
    address: 'Loading location...',
    fullAddress: 'Getting your current location...',
  });

  const [isPickupSelection, setIsPickupSelection] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: 12.8797, // Default Philippines center
    longitude: 121.7740,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false);
  const [isPickupLocationConfirmed, setIsPickupLocationConfirmed] = useState(false);
  const [isDriverAccepted, setIsDriverAccepted] = useState(false);
  const [userCurrentLocation, setUserCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showBookingCard, setShowBookingCard] = useState(false);
  const [hasSelectedBothLocations, setHasSelectedBothLocations] = useState(false);
  const [isCenteringMap, setIsCenteringMap] = useState(false);
  const lastRegionUpdateRef = useRef<number>(0);

  // Get actual pickup and destination locations
  const pickupLocation = useMemo(() => ({
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    title: "Pickup Location",
    address: selectedLocation.address
  }), [selectedLocation.latitude, selectedLocation.longitude, selectedLocation.address]);

  const destinationLocation = useMemo(() => ({
    latitude: route.params?.destination?.latitude || 0,
    longitude: route.params?.destination?.longitude || 0,
    title: route.params?.destination?.title || "Destination",
    address: route.params?.destination?.address || "Destination Address"
  }), [route.params?.destination?.latitude, route.params?.destination?.longitude, route.params?.destination?.title, route.params?.destination?.address]);

  // State for route data
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Google Directions API key (replace with your actual API key)
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBm-C_i4gqLwwmIQTURaGJW1D4i1ixwjts';

  // Function to decode Google's polyline
  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
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

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  };

  // Generate realistic curved route (fallback when API is not available)
  const generateRealisticRoute = (start: any, end: any) => {
    if (!start || !end) return [];
    
    const coordinates = [];
    const numPoints = 20; // Number of intermediate points
    
    for (let i = 0; i <= numPoints; i++) {
      const ratio = i / numPoints;
      
      // Calculate base position
      const lat = start.latitude + (end.latitude - start.latitude) * ratio;
      const lng = start.longitude + (end.longitude - start.longitude) * ratio;
      
      // Add curve variation to simulate following roads
      const curveIntensity = 0.002; // Adjust for more/less curve
      const curveOffset = Math.sin(ratio * Math.PI) * curveIntensity;
      
      // Add perpendicular offset for realistic road following
      const perpLat = (end.longitude - start.longitude) * curveOffset;
      const perpLng = -(end.latitude - start.latitude) * curveOffset;
      
      coordinates.push({
        latitude: lat + perpLat,
        longitude: lng + perpLng,
      });
    }
    
    return coordinates;
  };

  // Fetch route from Google Directions API
  const fetchRoute = async (pickup: any, destination: any) => {
    try {
      setIsLoadingRoute(true);
      console.log('Fetching route from Google Directions API...');
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.latitude},${pickup.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const encodedPolyline = route.overview_polyline.points;
        const decodedCoordinates = decodePolyline(encodedPolyline);
        
        console.log('Route fetched successfully:', decodedCoordinates.length, 'points');
        setRouteCoordinates(decodedCoordinates);
        
        // Center map on route with better padding to show entire route
        if (mapRef.current && decodedCoordinates.length > 0) {
          setTimeout(() => {
            setIsCenteringMap(true);
            mapRef.current.fitToCoordinates(decodedCoordinates, {
              edgePadding: { top: 150, right: 80, bottom: 300, left: 80 }, // Increased padding for better view
              animated: true,
            });
            setTimeout(() => {
              setIsCenteringMap(false);
            }, 2000);
          }, 500);
        }
      } else {
        console.error('Google Directions API error:', data.status);
        console.log('Using fallback realistic route generation...');
        // Generate realistic curved route as fallback
        const realisticRoute = generateRealisticRoute(pickup, destination);
        setRouteCoordinates(realisticRoute);
        
        // Center map on fallback route with better padding
        if (mapRef.current && realisticRoute.length > 0) {
          setTimeout(() => {
            setIsCenteringMap(true);
            mapRef.current.fitToCoordinates(realisticRoute, {
              edgePadding: { top: 150, right: 80, bottom: 300, left: 80 }, // Increased padding for better view
              animated: true,
            });
            setTimeout(() => {
              setIsCenteringMap(false);
            }, 2000);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      console.log('Using fallback realistic route generation...');
      // Generate realistic curved route as fallback
      const realisticRoute = generateRealisticRoute(pickup, destination);
      setRouteCoordinates(realisticRoute);
      
      // Center map on fallback route with better padding
      if (mapRef.current && realisticRoute.length > 0) {
        setTimeout(() => {
          setIsCenteringMap(true);
          mapRef.current.fitToCoordinates(realisticRoute, {
            edgePadding: { top: 150, right: 80, bottom: 300, left: 80 }, // Increased padding for better view
            animated: true,
          });
          setTimeout(() => {
            setIsCenteringMap(false);
          }, 2000);
        }, 500);
      }
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const bottomSheetHeight = useRef(new Animated.Value(height * 0.18)).current;
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isLookingForRideExpanded, setIsLookingForRideExpanded] = useState(false);
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<any>(null);
  
  // Toggle function for expand/collapse
  const toggleLookingForRide = () => {
    const toValue = isLookingForRideExpanded ? height * 0.18 : height * 0.45;
    Animated.timing(bottomSheetHeight, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setIsLookingForRideExpanded(!isLookingForRideExpanded);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setIsLoadingLocation(false);
        return;
      }

      // Try to get last known location first (faster)
      let location;
      try {
        const lastKnownLocation = await Location.getLastKnownPositionAsync({
          maxAge: 30000, // 30 seconds (shorter for better accuracy)
          requiredAccuracy: 50, // 50 meters (more accurate)
        });
        
        if (lastKnownLocation) {
          console.log('Using last known location for faster loading');
          location = lastKnownLocation;
        } else {
          throw new Error('No last known location');
        }
      } catch (lastKnownError) {
        console.log('No last known location, getting current position');
        // Fallback to current position with better accuracy
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation, // Most accurate
          timeInterval: 500, // 0.5 second
          distanceInterval: 0.5, // 0.5 meter
        });
      }

      const { latitude, longitude } = location.coords;
      
      // Validate location is reasonable (within Philippines bounds)
      const isReasonableLocation = latitude >= 4 && latitude <= 22 && 
                                  longitude >= 116 && longitude <= 127 &&
                                  !(latitude === 0 && longitude === 0); // Not at 0,0
      
      if (!isReasonableLocation) {
        console.log('Location seems invalid, using fallback');
        throw new Error('Invalid location coordinates');
      }
      
      // Store user's current location immediately
      setUserCurrentLocation({ latitude, longitude });
      
      // Update map region to user's location immediately
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Update selected location immediately with coordinates
      setSelectedLocation({
        latitude,
        longitude,
        address: 'Getting address...',
        fullAddress: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
      });

      // Get address in background (non-blocking)
      getAddressFromCoordinates(latitude, longitude).then(addressInfo => {
        setSelectedLocation(prev => ({
          ...prev,
        address: addressInfo.address,
        fullAddress: addressInfo.fullAddress,
        }));
      }).catch(error => {
        console.log('Address lookup failed:', error);
        // Keep the coordinate-based address if geocoding fails
      });

      setIsLoadingLocation(false);
    } catch (error) {
      console.log('Error getting location:', error);
      
      // Use a better fallback location (Manila, Philippines)
      const fallbackLocation = {
        latitude: 14.5995,
        longitude: 120.9842,
      };
      
      setUserCurrentLocation(fallbackLocation);
      setMapRegion({
        latitude: fallbackLocation.latitude,
        longitude: fallbackLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      setSelectedLocation({
        latitude: fallbackLocation.latitude,
        longitude: fallbackLocation.longitude,
        address: 'Manila, Philippines',
        fullAddress: 'Manila, Metro Manila, Philippines',
      });
      
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    // Try to get location immediately on mount
    const quickLocationSetup = async () => {
      try {
        // First, try to get last known location immediately (no permission check needed)
        const lastKnownLocation = await Location.getLastKnownPositionAsync({
          maxAge: 300000, // 5 minutes
          requiredAccuracy: 500, // 500 meters - more lenient for speed
        });
        
        if (lastKnownLocation) {
          const { latitude, longitude } = lastKnownLocation.coords;
          console.log('Quick location found:', latitude, longitude);
          
          // Set location immediately for instant display
          setUserCurrentLocation({ latitude, longitude });
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setSelectedLocation({
            latitude,
            longitude,
            address: 'Getting address...',
            fullAddress: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          });
          setIsLoadingLocation(false);
          
          // Get address in background
          getAddressFromCoordinates(latitude, longitude).then(addressInfo => {
            setSelectedLocation(prev => ({
              ...prev,
              address: addressInfo.address,
              fullAddress: addressInfo.fullAddress,
            }));
          });
          
          return; // Exit early if we got a quick location
        }
      } catch (error) {
        console.log('Quick location failed, falling back to full location check');
      }
      
      // Fallback to full location check
    getCurrentLocation();
    };
    
    quickLocationSetup();
  }, []);

  // Check if this is pickup selection (coming from TransportScreen with destination)
  useEffect(() => {
    if (route.params?.isPickupSelection) {
      console.log('Setting isPickupSelection to true');
      setIsPickupSelection(true);
      // Reset waiting states when coming for pickup selection
      setIsWaitingForDriver(false);
      setIsPickupLocationConfirmed(false);
      setIsDriverAccepted(false);
    }
    console.log('Route params:', route.params);
    console.log('isPickupSelection:', isPickupSelection);
    console.log('isWaitingForDriver:', isWaitingForDriver);
  }, [route.params]);

  // Debug effect to track UI state
  useEffect(() => {
    console.log('UI State Debug:', {
      isPickupSelection,
      isWaitingForDriver,
      isDriverAccepted,
      hasDestination: !!route.params?.destination,
      isPickupLocationConfirmed,
      shouldShowPickupUI: !isWaitingForDriver && !isDriverAccepted
    });
  }, [isPickupSelection, isWaitingForDriver, isDriverAccepted, route.params?.destination, isPickupLocationConfirmed]);

  // Reset states when screen is focused for pickup selection
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.isPickupSelection) {
        console.log('Screen focused - resetting states for pickup selection');
        setIsWaitingForDriver(false);
        setIsPickupLocationConfirmed(false);
        setIsDriverAccepted(false);
        setIsLookingForRideExpanded(false);
      }
    }, [route.params?.isPickupSelection])
  );

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      console.log('Getting address for:', latitude, longitude);
      
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      console.log('Reverse geocode result:', reverseGeocode);
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        console.log('Address details:', address);
        
        // Build a more detailed address
        const parts = [];
        
        if (address.streetNumber) parts.push(address.streetNumber);
        if (address.street) parts.push(address.street);
        if (address.district) parts.push(address.district);
        if (address.subregion) parts.push(address.subregion);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);
        
        const fullAddress = parts.filter(Boolean).join(', ');
        
        // Use the most specific location name available
        const shortName = address.street || 
                         address.district || 
                         address.subregion || 
                         address.city || 
                         'Selected Location';
        
        return {
          address: shortName,
          fullAddress: fullAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        };
      }
    } catch (error) {
      console.log('Error getting address:', error);
    }
    
    return {
      address: 'Selected Location',
      fullAddress: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
    };
  };

  const handleMapRegionChange = (region: any) => {
    // Don't update if map is being programmatically centered
    if (isCenteringMap) {
      return;
    }
    
    // Throttle region updates to prevent loops
    const now = Date.now();
    if (now - lastRegionUpdateRef.current < 100) {
      return; // Skip if updated less than 100ms ago
    }
    lastRegionUpdateRef.current = now;
    
    // Update region state but only if the change is significant enough to prevent micro-loops
    const currentRegion = mapRegion;
    const latDiff = Math.abs(region.latitude - currentRegion.latitude);
    const lngDiff = Math.abs(region.longitude - currentRegion.longitude);
    
    // Only update if the change is significant (more than 0.0001 degrees)
    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      setMapRegion(region);
    }
    
    // Only update selected location if pickup hasn't been confirmed yet
    if (!isPickupLocationConfirmed) {
      // Clear previous timeout
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
      
      // Set loading state
      setIsLoadingAddress(true);
      
      // Debounce the address lookup to avoid too many API calls
      addressTimeoutRef.current = setTimeout(async () => {
        try {
          // Get actual address for the selected location
          const addressInfo = await getAddressFromCoordinates(region.latitude, region.longitude);
          
          // Update the pin position to the center of the map
          setSelectedLocation({
            latitude: region.latitude,
            longitude: region.longitude,
            address: addressInfo.address,
            fullAddress: addressInfo.fullAddress,
          });
        } catch (error) {
          console.log('Error updating address:', error);
          setSelectedLocation({
            latitude: region.latitude,
            longitude: region.longitude,
            address: 'Selected Location',
            fullAddress: `Lat: ${region.latitude.toFixed(6)}, Lng: ${region.longitude.toFixed(6)}`,
          });
        } finally {
          setIsLoadingAddress(false);
        }
      }, 1000); // Wait 1 second after user stops moving the map
    }
  };

  const handleBack = () => {
    // Go back to Transport screen with current selected location
    navigation.navigate('Transport', { selectedLocation });
  };

  const isAtCurrentLocation = () => {
    if (!userCurrentLocation) return false;
    
    const distance = Math.sqrt(
      Math.pow(selectedLocation.latitude - userCurrentLocation.latitude, 2) +
      Math.pow(selectedLocation.longitude - userCurrentLocation.longitude, 2)
    );
    
    // Consider locations within ~0.001 degrees as "at current location"
    // This is roughly 100 meters
    return distance < 0.001;
  };

  const handleCenterLocation = () => {
    if (userCurrentLocation && mapRef.current) {
      // Center map on user's current location with smooth animation
      const newRegion = {
        latitude: userCurrentLocation.latitude,
        longitude: userCurrentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      // Update the region state first
      setMapRegion(newRegion);
      
      // Then animate to the new region
      mapRef.current.animateToRegion(newRegion, 1000);
      
      // Update the selected location to match
      setSelectedLocation(prev => ({
        ...prev,
        latitude: userCurrentLocation.latitude,
        longitude: userCurrentLocation.longitude,
      }));
    }
  };

  const handleChooseDestination = () => {
    if (selectedLocation) {
      if (isPickupSelection && route.params?.destination) {
        // Both pickup and destination are selected - fetch route and show booking card
        console.log('Both pickup and destination selected - fetching route and showing booking card');
        setIsPickupLocationConfirmed(true); // Mark pickup location as confirmed
        
        // Fetch realistic route from Google Directions API
        fetchRoute(pickupLocation, destinationLocation);
      } else {
        // Navigate back to Transport screen with selected location
        navigation.navigate('Transport', { selectedLocation });
      }
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'Keep Booking',
          style: 'cancel',
        },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            // Reset all booking states
            setIsWaitingForDriver(false);
            setIsPickupLocationConfirmed(false);
            setIsDriverAccepted(false);
            setIsLookingForRideExpanded(false);
            setHasSelectedBothLocations(false);
            setShowBookingCard(false);
            
            // Reset bottom sheet to collapsed state
            Animated.timing(bottomSheetHeight, {
              toValue: height * 0.18,
              duration: 200,
              useNativeDriver: false,
            }).start();
            
            // Navigate back to Transport screen
            navigation.navigate('Transport', { selectedLocation });
          },
        },
      ]
    );
  };

  const handleBook = () => {
    // Hide the booking card
    setShowBookingCard(false);
    
    // Trigger finding driver screen
    setIsWaitingForDriver(true);
    setIsPickupLocationConfirmed(true);
    
    // Expand the bottom sheet to show finding driver UI
    Animated.timing(bottomSheetHeight, {
      toValue: height * 0.45,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setIsLookingForRideExpanded(true);
  };


  // Show booking card when both pickup and destination are selected (but not yet booked)
  useEffect(() => {
    if (isPickupSelection && route.params?.destination && isPickupLocationConfirmed && !isWaitingForDriver) {
      setHasSelectedBothLocations(true);
      setShowBookingCard(true);
    } else {
      setHasSelectedBothLocations(false);
      setShowBookingCard(false);
    }
  }, [isPickupSelection, route.params?.destination, isPickupLocationConfirmed, isWaitingForDriver]);

  const toggleBottomSheet = () => {
    const toValue = isBottomSheetExpanded ? height * 0.18 : height * 0.35;
    Animated.timing(bottomSheetHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsBottomSheetExpanded(!isBottomSheetExpanded);
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Map */}
      {Platform.OS !== 'web' && MapView ? (
        <MapView
          provider="google"
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={!isCenteringMap ? handleMapRegionChange : undefined}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          mapType="standard"
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          customMapStyle={[
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#f8f9fa"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#374151"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#f8f9fa"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#dbeafe"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#1e40af"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#6b7280"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#ffffff"
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#9ca3af"
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#374151"
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#d1d5db"
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#6b7280"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#dcfce7"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#166534"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#f3f4f6"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#374151"
                }
              ]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#f3f4f6"
                }
              ]
            },
            {
              "featureType": "administrative",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#374151"
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#f3f4f6"
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#6b7280"
                }
              ]
            }
          ]}
        >
          {/* Show destination marker if destination is provided */}
          {route.params?.destination && (
            <Marker
              coordinate={{
                latitude: route.params.destination.latitude,
                longitude: route.params.destination.longitude,
              }}
              title="Destination"
              description={route.params.destination.title}
            >
              <View style={styles.destinationMarker}>
                <Ionicons name="flag" size={20} color="white" />
              </View>
            </Marker>
          )}

        {/* Route Polyline - Show only when pickup location is confirmed */}
        {isPickupLocationConfirmed && route.params?.destination && routeCoordinates.length >= 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#00b050"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Loading indicator for route */}
        {isLoadingRoute && (
          <View style={styles.routeLoadingContainer}>
            <View style={styles.routeLoadingIndicator}>
              <Ionicons name="navigate" size={20} color="#00b050" />
              <Text style={styles.routeLoadingText}>Finding best route...</Text>
            </View>
          </View>
        )}

        {/* Pickup Marker - Show only when pickup is confirmed */}
        {isPickupLocationConfirmed && route.params?.destination && (
          <Marker
            coordinate={pickupLocation}
            title={pickupLocation.title}
            description={pickupLocation.address}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.pickupMarker}>
              <Ionicons name="location" size={16} color="white" />
            </View>
          </Marker>
        )}

        {/* Pickup Label - Positioned closer to the marker */}
        {isPickupLocationConfirmed && route.params?.destination && (
          <Marker
            coordinate={{
              latitude: pickupLocation.latitude + 0.0003, // Smaller offset for closer positioning
              longitude: pickupLocation.longitude + 0.0003,
            }}
            anchor={{ x: 0, y: 0.5 }}
          >
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>{pickupLocation.title}</Text>
            </View>
          </Marker>
        )}

        {/* Destination Marker - Show only when pickup is confirmed */}
        {isPickupLocationConfirmed && route.params?.destination && (
          <Marker
            coordinate={destinationLocation}
            title={destinationLocation.title}
            description={destinationLocation.address}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="flag" size={16} color="white" />
            </View>
          </Marker>
        )}

        {/* Destination Label - Positioned closer to the marker */}
        {isPickupLocationConfirmed && route.params?.destination && (
          <Marker
            coordinate={{
              latitude: destinationLocation.latitude + 0.0003, // Smaller offset for closer positioning
              longitude: destinationLocation.longitude + 0.0003,
            }}
            anchor={{ x: 0, y: 0.5 }}
          >
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>{destinationLocation.title}</Text>
            </View>
          </Marker>
        )}

        {/* Show pickup marker with pulsating effect only when finding a driver */}
        {isWaitingForDriver && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Pickup Location (Finding Driver)"
            description={selectedLocation.address}
          >
            <PulsatingMarker
              size={32}
              color="#58BC6B"
              pulseColor="#58BC6B"
              animationDuration={2000}
              pulseCount={3}
              iconName="location"
              iconColor="white"
              iconSize={16}
            />
          </Marker>
        )}
        
        {/* Show static pickup marker when driver has accepted */}
        {isPickupSelection && route.params?.destination && isPickupLocationConfirmed && isDriverAccepted && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Pickup Location (Driver Accepted)"
            description={selectedLocation.address}
          >
            <View style={styles.pickupMarkerAccepted}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </Marker>
        )}
        
        {/* Show regular pickup marker while selecting (before confirmation) */}
        {isPickupSelection && route.params?.destination && !isPickupLocationConfirmed && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Pickup Location (Selecting)"
            description={selectedLocation.address}
          >
            <View style={styles.pickupMarker}>
              <Ionicons name="location" size={16} color="white" />
            </View>
          </Marker>
        )}

        {/* Show static pickup marker when booking card is visible (after confirmation, before booking) */}
        {isPickupSelection && route.params?.destination && isPickupLocationConfirmed && !isWaitingForDriver && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Pickup Location (Confirmed)"
            description={selectedLocation.address}
          >
            <View style={styles.pickupMarker}>
              <Ionicons name="location" size={16} color="white" />
            </View>
          </Marker>
        )}
          
          
        </MapView>
      ) : (
        <View style={[styles.map, styles.webMapFallback]}>
          <Text style={styles.webMapText}>Map not available on web</Text>
          <Text style={styles.webMapSubtext}>Please use the mobile app for full map functionality</Text>
        </View>
      )}
      
      {/* Fixed Center Pin Overlay - Hide when pickup is confirmed */}
      {!isPickupLocationConfirmed && (
      <View style={styles.fixedPinContainer}>
        <View style={styles.customMarker}>
          <View style={styles.markerPin}>
            <Ionicons name="location" size={20} color="white" />
          </View>
          <View style={styles.markerShadow} />
        </View>
      </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        {isLoadingLocation && (
          <View style={styles.loadingIndicator}>
            <Ionicons name="location" size={16} color="#58BC6B" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        )}
      </View>

      {/* Pinpoint/My Location Button - Hide when pickup is confirmed */}
      {userCurrentLocation && !isPickupLocationConfirmed && (
        <View style={styles.pinpointButtonContainer}>
          <TouchableOpacity 
            style={[styles.pinpointButton, isAtCurrentLocation() && styles.pinpointButtonActive]} 
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}


      {/* Booking Card - Fixed at bottom - Show when both locations are selected */}
      {hasSelectedBothLocations && (
        <View style={styles.bookingCard}>
          <View style={styles.bookingCardContent}>
            {/* Vehicle Type Row */}
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleInfo}>
                <Ionicons name="bicycle" size={20} color="#333" />
                <Text style={styles.vehicleType}>Mototaxi</Text>
              </View>
              <Text style={styles.fareAmount}>₱84.00</Text>
            </View>
            
            {/* Drop off time */}
            <Text style={styles.dropOffTime}>4:25PM - 4:35PM drop off</Text>
            
            {/* Payment Row */}
            <View style={styles.paymentRow}>
              <View style={styles.bookingPaymentInfo}>
                <Text style={styles.bookingPaymentText}>Cash</Text>
                <Text style={styles.currencySymbol}>₱</Text>
              </View>
              <View style={styles.divider} />
            </View>
            
            {/* Book Button */}
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={handleBook}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Expand/Collapse Buttons - Right side, always at top of card */}
      {isWaitingForDriver && (
        <Animated.View 
          style={[
            styles.expandCollapseContainer,
            {
              bottom: Animated.add(bottomSheetHeight, 20), // Always 20px above the card
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.expandCollapseButton}
            onPress={toggleLookingForRide}
          >
            <Ionicons 
              name={isLookingForRideExpanded ? "chevron-down" : "chevron-up"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom Sheet - Only show when waiting for driver */}
      {isWaitingForDriver && (
      <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
          {/* Looking for a ride UI */}
          <View style={styles.lookingForRideContainer}>
            {/* Looking for a ride card - No internal drag handle */}
            <View style={styles.lookingForRideCard}>
              <View style={styles.lookingForRideContent}>
                <Image 
                  source={require('../assets/ticycle.png')} 
                  style={styles.tricycleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.lookingForRideText}>Looking for a ride</Text>
              </View>
            </View>


            {/* Test button to simulate driver acceptance */}
            <TouchableOpacity
              style={styles.testDriverAcceptButton}
              onPress={() => {
                console.log('Manual driver acceptance triggered');
                setIsDriverAccepted(true);
                setIsWaitingForDriver(false);
              }}
            >
              <Text style={styles.testDriverAcceptText}>Test: Driver Accepts</Text>
            </TouchableOpacity>


            {/* Booking summary - Only show when expanded */}
            {isLookingForRideExpanded && (
              <View style={styles.bookingSummaryCard}>
                <View style={styles.bookingItem}>
                  <View style={styles.bookingDot} />
                  <Text style={styles.bookingText}>{selectedLocation.address}</Text>
                </View>
                <View style={styles.bookingItem}>
                  <View style={[styles.bookingDot, { backgroundColor: '#FF4444' }]} />
                  <Text style={styles.bookingText}>{route.params?.destination?.title || 'Destination'}</Text>
                </View>
                <View style={styles.bookingFooter}>
                  <View style={styles.paymentInfo}>
                    <Ionicons name="card" size={16} color="#666" />
                    <Text style={styles.paymentText}>Cash</Text>
                  </View>
                  <Text style={styles.fareText}>P84.00</Text>
                </View>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancelBooking}
                >
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Regular pickup selection UI - Show when not waiting for driver and pickup not confirmed */}
      {!isWaitingForDriver && !isDriverAccepted && !isPickupLocationConfirmed && (
        <View style={styles.locationDetails}>
          <View style={styles.locationHeader}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#666" />
              <View style={styles.locationText}>
            <Text style={styles.locationTitle}>
                  {isPickupSelection ? selectedLocation.address : 
               isLoadingLocation ? 'Getting your location...' : 
               isLoadingAddress ? 'Getting address...' : selectedLocation.address}
            </Text>
            <Text style={styles.locationSubtitle}>
              {isPickupSelection ? 'Choose where you want to be picked up' :
               isLoadingLocation ? 'Please wait...' : 
               isLoadingAddress ? 'Please wait...' : selectedLocation.fullAddress}
            </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.chooseButton, (isLoadingLocation || isLoadingAddress) && styles.chooseButtonDisabled]} 
            onPress={handleChooseDestination}
            disabled={isLoadingLocation || isLoadingAddress}
          >
            <Text style={styles.chooseButtonText}>
              {isPickupSelection ? 'Choose This Pickup Location' :
               isLoadingLocation ? 'Loading...' : 
               isLoadingAddress ? 'Getting address...' : 'Choose This Destination'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinpointButtonContainer: {
    position: 'absolute',
    bottom: height * 0.25 + 40, // Move up higher to avoid card overlap
    right: 20,
    zIndex: 1,
  },
  pinpointButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expandCollapseContainer: {
    position: 'absolute',
    right: 20, // Position on the right side
    zIndex: 10,
  },
  expandCollapseButton: {
    backgroundColor: '#58BC6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34, // Account for home indicator
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  chooseButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  chooseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chooseButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  fixedPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20, // Half of pin height to center it
    marginLeft: -20, // Half of pin width to center it
    zIndex: 1000,
    pointerEvents: 'none', // Allow touches to pass through to map
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  markerShadow: {
    width: 20,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    marginTop: -5,
    transform: [{ scaleX: 0.8 }],
  },
  webMapFallback: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Loading Indicator Styles
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#58BC6B',
    fontWeight: '500',
    marginLeft: 6,
  },
  // Destination Marker Styles
  pinpointButtonActive: {
    backgroundColor: '#007AFF',
  },
  // Pickup Marker Styles
  pickupMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Marker Label Styles
  markerLabel: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    maxWidth: 120,
  },
  markerLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  // Route Loading Styles
  routeLoadingContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  routeLoadingIndicator: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#00b050',
  },
  pickupMarkerAccepted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Looking for a ride UI styles
  lookingForRideContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  lookingForRideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  lookingForRideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tricycleIcon: {
    width: 24,
    height: 24,
  },
  lookingForRideText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  bookingSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  bookingText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  fareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
  },
  testDriverAcceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
  },
  testDriverAcceptText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Booking Card Styles
  bookingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingCardContent: {
    padding: 20,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropOffTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bookingPaymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingPaymentText: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 12,
  },
  bookButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Marker Styles
  destinationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default MapSelectionScreen;
