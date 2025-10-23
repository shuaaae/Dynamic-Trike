import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { HomeScreenNavigationProp } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 12.663276,
    longitude: 123.930705,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [isCenteredOnUser, setIsCenteredOnUser] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  const [recentLocations, setRecentLocations] = useState<Array<{
    name: string;
    address: string;
    time: string;
    icon: string;
  }>>([]);
  const [savedHome, setSavedHome] = useState<{
    name: string;
    address: string;
    time: string;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const lastCompassUpdate = useRef(0);
  const lastLocationUpdate = useRef(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  // Check if map is centered on user's location
  const checkIfCenteredOnUser = (userLocation: LocationData, mapCenter: { latitude: number; longitude: number }, mapZoom: number): boolean => {
    if (!userLocation) return false;
    
    const distance = calculateDistance(
      userLocation.latitude, 
      userLocation.longitude, 
      mapCenter.latitude, 
      mapCenter.longitude
    );
    
    // Consider locations within 50 meters as "centered"
    const isNearLocation = distance < 50;
    
    // Also check if zoom level is close to the target zoom (0.005)
    const isCloseZoom = mapZoom <= 0.01; // Allow some tolerance
    
    return isNearLocation && isCloseZoom;
  };

  // Handle map region changes to detect when user moves away from current location
  const handleMapRegionChange = (region: any) => {
    if (location) {
      const isCentered = checkIfCenteredOnUser(location, {
        latitude: region.latitude,
        longitude: region.longitude
      }, region.latitudeDelta);
      
      setIsCenteredOnUser(isCentered);
      setIsButtonEnabled(!isCentered);
    }
  };

  // Smooth rotation interpolation to prevent sudden jumps
  const smoothRotation = (targetHeading: number) => {
    const now = Date.now();
    
    // Throttle updates to 120fps for faster response
    if (now - lastCompassUpdate.current < 8) {
      return;
    }
    lastCompassUpdate.current = now;
    
    const currentHeading = compassHeading;
    let rotation = targetHeading - currentHeading;
    
    // Handle the 0-360 degree wraparound
    if (rotation > 180) {
      rotation -= 360;
    } else if (rotation < -180) {
      rotation += 360;
    }
    
    // Skip very small rotations to prevent jitter
    if (Math.abs(rotation) < 0.5) {
      return;
    }
    
    const newHeading = currentHeading + rotation;
    setCompassHeading(newHeading);
    
    // Use different animation based on rotation magnitude
    if (Math.abs(rotation) > 10) {
      // Large rotation - use spring for smooth movement
      Animated.spring(rotationAnim, {
        toValue: newHeading,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      // Small rotation - use timing for immediate response
      Animated.timing(rotationAnim, {
        toValue: newHeading,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  };

  // Watch for actual GPS location changes (only when walking/moving)
  const watchLocationChanges = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      // Watch for significant location changes only
      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000, // Update every 2 seconds
          distanceInterval: 5, // Only update if moved 5+ meters
        },
        (newLocation) => {
          const now = Date.now();
          
          // Throttle location updates to prevent excessive updates
          if (now - lastLocationUpdate.current < 1000) {
            return;
          }
          lastLocationUpdate.current = now;

          const locationData: LocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy || 0,
            timestamp: new Date().toISOString()
          };

          setLocation(locationData);
          
          const newRegion = {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          setMapRegion(newRegion);

          // Smoothly animate to new location
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching location changes:', error);
      return null;
    }
  };

  // Get compass heading from device orientation
  const getCompassHeading = async () => {
    try {
      // Request permission for device motion
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied for compass');
        return null;
      }

      // Use watchHeadingAsync for real-time compass updates
      // This ONLY tracks rotation, NOT position changes
      const subscription = Location.watchHeadingAsync((heading) => {
        if (heading.magHeading !== null) {
          // Only update rotation, not location
          smoothRotation(heading.magHeading);
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error getting compass heading:', error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Disable button during animation
      setIsButtonEnabled(false);

      // Start animation immediately if we have a previous location
      if (location && mapRef.current) {
        const currentRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        mapRef.current.animateToRegion(currentRegion, 2000);
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || 0,
        timestamp: new Date().toISOString()
      };

      setLocation(locationData);
      
      const newRegion = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setMapRegion(newRegion);

      // Animate to the new location if we didn't animate before
      if (mapRef.current && !location) {
        mapRef.current.animateToRegion(newRegion, 2000);
      }

      // After animation completes, update button state
      setTimeout(() => {
        setIsCenteredOnUser(true);
        setIsButtonEnabled(false);
      }, 2000);
    } catch (error) {
      console.error('Error getting location:', error);
      // Re-enable button on error
      setIsButtonEnabled(true);
    }
  };

  useEffect(() => {
    // Get initial location
    getCurrentLocation();
    
    // Load recent locations
    loadRecentLocations();
    
    // Load saved home
    loadSavedHome();
    
    // Start separate watchers
    let compassSubscription: any;
    let locationSubscription: any;
    
    const startWatchers = async () => {
      // Start compass tracking (rotation only)
      compassSubscription = await getCompassHeading();
      
      // Start location tracking (position changes only)
      locationSubscription = await watchLocationChanges();
    };
    
    startWatchers();
    
    // Cleanup subscriptions
    return () => {
      if (compassSubscription) {
        compassSubscription.remove();
      }
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Dynamic quick actions based on saved data
  const getQuickActions = () => {
    const actions = [];
    
    // Home action - dynamic based on whether home is saved
    if (savedHome) {
      actions.push({
        name: 'Home',
        time: savedHome.time,
        icon: 'paper-plane',
        color: '#58BC6B'
      });
    } else {
      actions.push({
        name: 'Home',
        time: 'Add Home',
        icon: 'add',
        color: '#58BC6B'
      });
    }
    
    // Work action - always shows add
    actions.push({
      name: 'Work',
      time: 'Add Work',
      icon: 'add',
      color: '#58BC6B'
    });
    
    return actions;
  };

  // Load recent booking history
  const loadRecentLocations = async () => {
    try {
      // TODO: Replace with actual API call to get booking history
      // For now, we'll simulate loading from a local storage or API
      const mockBookingHistory = [
        {
          id: '1',
          destination: 'Near Masbate-Sisigon-Bulan Road',
          address: 'G. Del Pilar (Tanga), Bulan, Sorsogon, Philippines',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: 'time'
        },
        {
          id: '2', 
          destination: 'Bulan Public Market',
          address: 'Bulan, Sorsogon, Philippines',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          icon: 'storefront'
        },
        {
          id: '3',
          destination: 'Bulan Municipal Hall', 
          address: 'Bulan, Sorsogon, Philippines',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          icon: 'business'
        }
      ];

      // Get the most recent booking
      const latestBooking = mockBookingHistory[0];
      
      // Calculate time ago
      const timeAgo = getTimeAgo(latestBooking.timestamp);
      
      // Set the most recent location
      setRecentLocations([{
        name: latestBooking.destination,
        address: latestBooking.address,
        time: timeAgo,
        icon: latestBooking.icon
      }]);
    } catch (error) {
      console.error('Error loading recent locations:', error);
      // Keep empty array if there's an error
      setRecentLocations([]);
    }
  };

  // Load saved home data
  const loadSavedHome = async () => {
    try {
      // TODO: Replace with actual API call to get saved places
      // For now, we'll simulate loading from local storage
      const mockSavedHome = {
        name: 'Home',
        address: '123 Main Street, Bulan, Sorsogon',
        time: '2 min'
      };
      
      // Simulate checking if home is saved (you can change this to null to test the + icon)
      setSavedHome(mockSavedHome);
    } catch (error) {
      console.error('Error loading saved home:', error);
      setSavedHome(null);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Map Area */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
          onRegionChangeComplete={handleMapRegionChange}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              description="Current position"
            >
              <Animated.View 
                style={[
                  styles.customMarker,
                  {
                    transform: [
                      {
                        rotate: rotationAnim.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="paper-plane" size={20} color="#58BC6B" />
              </Animated.View>
            </Marker>
          )}
        </MapView>
        

        {/* Book a Ride Button */}
        <TouchableOpacity 
          style={styles.bookRideButton}
          onPress={() => navigation.navigate('Transport', {
            selectedLocation: {
              latitude: 12.8797,
              longitude: 121.7740,
              address: 'Select destination',
              fullAddress: 'Tap the map to select your destination',
            }
          })}
        >
          <Image source={require('../assets/ticycle.png')} style={styles.tricycleIcon} />
          <Text style={styles.bookRideText}>Book a ride</Text>
        </TouchableOpacity>

        {/* Pinpoint Location Button */}
        <TouchableOpacity 
          style={[
            styles.pinpointButton,
            !isButtonEnabled && styles.pinpointButtonDisabled
          ]}
          onPress={isButtonEnabled ? getCurrentLocation : undefined}
          disabled={!isButtonEnabled}
          activeOpacity={isButtonEnabled ? 0.7 : 1}
        >
          <Ionicons 
            name="locate" 
            size={20} 
            color={isButtonEnabled ? "#FFFFFF" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Overlay */}
      <View style={styles.bottomOverlay}>
        <SafeAreaView>
          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchContainer}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <Text style={styles.searchInput}>
              Where are you heading to?
            </Text>
          </TouchableOpacity>

          {/* Quick Action Cards */}
          <View style={styles.quickActionsContainer}>
            {getQuickActions().map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionCard}>
                <View style={styles.quickActionContent}>
                  <Ionicons 
                    name={action.icon as any} 
                    size={20} 
                    color={action.color} 
                    style={styles.quickActionIcon}
                  />
                  <View style={styles.quickActionTextContainer}>
                    <Text style={styles.quickActionTime}>{action.time}</Text>
                    <Text style={styles.quickActionName}>{action.name}</Text>
                  </View>
                </View>
                <Ionicons name={action.icon as any} size={16} color="#333" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Locations */}
          <View style={styles.recentLocationsContainer}>
            {recentLocations.length > 0 ? (
              recentLocations.slice(0, 1).map((location, index) => (
                <TouchableOpacity key={index} style={styles.recentLocationCard}>
                  <View style={styles.recentLocationContent}>
                    <Ionicons 
                      name={location.icon as any} 
                      size={20} 
                      color="#666" 
                      style={styles.recentLocationIcon}
                    />
                    <View style={styles.recentLocationTextContainer}>
                      <Text style={styles.recentLocationName} numberOfLines={1}>
                        {location.name}
                      </Text>
                      <Text style={styles.recentLocationAddress} numberOfLines={1}>
                        {location.address}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recentLocationTime}>{location.time}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noRecentLocations}>
                <Text style={styles.noRecentLocationsText}>
                  No recent rides yet
                </Text>
              </View>
            )}
          </View>

        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#58BC6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bookRideButton: {
    position: 'absolute',
    bottom: 10,
    left: width / 2 - 50,
    backgroundColor: '#58BC6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bookRideText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tricycleIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  pinpointButton: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#58BC6B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinpointButtonDisabled: {
    backgroundColor: '#58BC6B',
    opacity: 0.4,
  },
  bottomOverlay: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '50%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    marginRight: 12,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  quickActionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentLocationsContainer: {
    marginBottom: 20,
  },
  recentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentLocationIcon: {
    marginRight: 12,
  },
  recentLocationTextContainer: {
    flex: 1,
  },
  recentLocationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  recentLocationAddress: {
    fontSize: 12,
    color: '#666',
  },
  recentLocationTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  noRecentLocations: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noRecentLocationsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});