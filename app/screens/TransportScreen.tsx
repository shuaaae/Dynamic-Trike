import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import MapView, { Marker } from 'react-native-maps';
import { searchPlaces, fallbackSearch, PlaceResult } from '../services/googlePlacesService';
import * as Location from 'expo-location';
import PulsatingMarker from '../components/PulsatingMarker';

const { width, height } = Dimensions.get('window');

interface LocationItem {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: 'recent' | 'suggested' | 'saved';
  latitude?: number;
  longitude?: number;
  placeId?: string;
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

interface TransportScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Transport'>;
  route: RouteProp<RootStackParamList, 'Transport'>;
}

export const TransportScreen: React.FC<TransportScreenProps> = ({ navigation, route }) => {
  const [destination, setDestination] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(route.params?.selectedLocation);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Recent');
  const [selectedDestination, setSelectedDestination] = useState<{
    title: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    fullAddress: string;
  } | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isFindingDriver, setIsFindingDriver] = useState(false);
  const [hasProcessedPickup, setHasProcessedPickup] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Loading dots animation values
  const loadingDotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const loadingDotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const loadingDotOpacity3 = useRef(new Animated.Value(0.3)).current;
  
  // Get current location for search context
  const getCurrentLocation = async (retryCount = 0) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Try to get last known location first (faster)
      let location = await Location.getLastKnownPositionAsync({
        maxAge: 30000, // 30 seconds (shorter for better accuracy)
        requiredAccuracy: 50, // 50 meters (more accurate)
      });

      // If no last known location or it's too old, get current position
      if (!location) {
        console.log('No last known location, getting current position...');
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation, // Most accurate
          timeInterval: 500, // 0.5 second
          distanceInterval: 0.5, // 0.5 meter
        });
      }

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      // Validate location is reasonable (within Philippines bounds)
      const isReasonableLocation = coords.latitude >= 4 && coords.latitude <= 22 && 
                                  coords.longitude >= 116 && coords.longitude <= 127 &&
                                  !(coords.latitude === 0 && coords.longitude === 0);
      
      if (!isReasonableLocation) {
        console.log('Location seems invalid (outside Philippines), retrying...');
        if (retryCount < 2) {
          // Retry with different accuracy settings
          setTimeout(() => {
            getCurrentLocation(retryCount + 1);
          }, 1000);
          return;
        } else {
          throw new Error('Invalid location coordinates after retries');
        }
      }
      
      setCurrentLocation(coords);
      console.log('Current location:', coords);
    } catch (error) {
      console.error('Error getting current location:', error);
      // Fallback to a default location (Manila, Philippines)
      const fallbackCoords = {
        latitude: 14.5995,
        longitude: 120.9842,
      };
      setCurrentLocation(fallbackCoords);
      console.log('Using fallback location:', fallbackCoords);
    }
  };

  // Loading dots animation effect
  useEffect(() => {
    if (isFindingDriver) {
      const createPulseAnimation = (animatedValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              delay: delay,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation1 = createPulseAnimation(loadingDotOpacity1, 0);
      const animation2 = createPulseAnimation(loadingDotOpacity2, 200);
      const animation3 = createPulseAnimation(loadingDotOpacity3, 400);

      animation1.start();
      animation2.start();
      animation3.start();

      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    } else {
      // Reset opacity when not finding driver
      loadingDotOpacity1.setValue(0.3);
      loadingDotOpacity2.setValue(0.3);
      loadingDotOpacity3.setValue(0.3);
      return undefined;
    }
  }, [isFindingDriver]);

  // Real search function using Google Places API
  const searchPlacesAPI = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      console.log('[Transport] Searching for:', query);

      // Call Google Places API
      const results = await searchPlaces(query, currentLocation || undefined);
      
      // Transform results to LocationItem format
      const locationItems: LocationItem[] = results.map((place: PlaceResult) => ({
        id: place.placeId || Math.random().toString(),
        name: place.name || 'Unknown Place',
        address: place.address || 'Address not available',
        distance: place.distance || '',
        type: 'suggested' as const,
        latitude: place.latitude,
        longitude: place.longitude,
        placeId: place.placeId,
        types: place.types,
        businessStatus: place.businessStatus,
        priceLevel: place.priceLevel,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        phoneNumber: place.phoneNumber,
        websiteUri: place.websiteUri,
        addressComponents: place.addressComponents,
      }));

      setSearchResults(locationItems);
      console.log('[Transport] Search results:', locationItems.length, 'places found');
    } catch (error) {
      console.error('[Transport] Search error:', error);
      setSearchError('Failed to search places. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Get current location on component mount and when screen is focused
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Also get location when screen is focused (when coming back from other screens)
  useFocusEffect(
    React.useCallback(() => {
      getCurrentLocation();
    }, [])
  );

  // Debug effect to track state changes
  useEffect(() => {
    console.log('State changed - isFindingDriver:', isFindingDriver, 'selectedPickup:', !!selectedPickup, 'selectedDestination:', !!selectedDestination);
  }, [isFindingDriver, selectedPickup, selectedDestination]);
  
  // Handle destination from route params (when coming from MapSelection with destination)
  useEffect(() => {
    if (route.params?.destination && !selectedDestination) {
      console.log('Setting destination from route params:', route.params.destination);
      setSelectedDestination(route.params.destination);
      setDestination(route.params.destination.title);
    }
  }, [route.params?.destination, selectedDestination]);

  // Update selected location when returning from MapSelection
  useFocusEffect(
    React.useCallback(() => {
      const currentSelectedLocation = route.params?.selectedLocation;
      if (currentSelectedLocation && !hasProcessedPickup) {
        console.log('Location received:', currentSelectedLocation);
        console.log('Current selectedDestination:', selectedDestination);
        
        // If we have a destination selected, this is pickup location
        if (selectedDestination) {
          console.log('Setting pickup location and starting to find driver');
          console.log('Current state - isFindingDriver:', isFindingDriver, 'hasProcessedPickup:', hasProcessedPickup);
          setSelectedPickup(currentSelectedLocation);
          setIsFindingDriver(true);
          setHasProcessedPickup(true);
          
          // Simulate finding driver for 3 seconds, then show booking confirmation
          setTimeout(() => {
            console.log('Finding driver timeout completed, setting isFindingDriver to false');
            setIsFindingDriver(false);
          }, 3000);
        } else {
          console.log('Setting regular location');
          // Otherwise it's just a regular location update
          setSelectedLocation(currentSelectedLocation);
          setDestination(currentSelectedLocation.address);
        }
      }
    }, [route.params?.selectedLocation, selectedDestination, hasProcessedPickup])
  );

  const handleBack = () => {
    navigation.navigate('MainTabs');
  };

  const handleMapPress = () => {
    navigation.navigate('MapSelection');
  };

  const handleDestinationPress = () => {
    setIsSearchModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSearchModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSearchModalVisible(false);
    });
  };

  const handleChooseOnMap = () => {
    // Close the search modal first
    closeSearchModal();
    // Then navigate to MapSelection screen
    navigation.navigate('MapSelection');
  };

  const handleDestinationSelect = (destinationData: {
    title: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    console.log('=== handleDestinationSelect called ===');
    console.log('Destination data:', destinationData);
    console.log('Setting destination state...');
    setSelectedDestination(destinationData);
    setDestination(destinationData.title);
    console.log('Navigating to MapSelection...');
    // Navigate directly to MapSelectionScreen to select pickup location
    navigation.navigate('MapSelection', { 
      isPickupSelection: true,
      destination: destinationData 
    });
  };

  const handleSavedPlacePress = (placeType: string) => {
    console.log(`Selected ${placeType}`);
    // Handle saved place selection
  };

  const renderSavedPlace = (icon: string, label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.savedPlaceButton} onPress={onPress}>
      <View style={styles.savedPlaceIcon}>
        <Ionicons name={icon as any} size={24} color="#58BC6B" />
        <View style={styles.plusIcon}>
          <Ionicons name="add" size={12} color="#3B82F6" />
        </View>
      </View>
      <Text style={styles.savedPlaceLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" translucent />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Transport</Text>
          <Text style={styles.headerSubtitle}>Wherever you're going, let's get you there!</Text>
        </View>
        
        <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
          <Ionicons name="map" size={20} color="#58BC6B" />
          <Text style={styles.mapButtonText}>Map</Text>
        </TouchableOpacity>
        
         {/* Onboard3 Image */}
         <View style={styles.illustrationContainer}>
           <Image 
             source={require('../assets/images/onboarding/onboard3.png')} 
             style={styles.onboardImage}
             resizeMode="contain"
           />
         </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Where to Input */}
        <TouchableOpacity style={styles.destinationInput} onPress={handleDestinationPress}>
          <Ionicons name="location" size={20} color="#58BC6B" style={styles.inputIcon} />
          <Text style={styles.inputPlaceholder}>Where to?</Text>
        </TouchableOpacity>

        {/* Suggested Destination */}
        <TouchableOpacity 
          style={styles.suggestedDestination}
          onPress={() => handleDestinationSelect({
            title: 'Rhu-Bulan, Sorsogon',
            address: 'Benigno S. Aquino (Imelda), Bulan, Sorsogon, 4706, Bicol (Region V), Philippines',
            latitude: 12.8797,
            longitude: 121.7740
          })}
        >
          <View style={styles.suggestedIcon}>
            <Ionicons name="location" size={16} color="#58BC6B" />
          </View>
          <View style={styles.suggestedContent}>
            <Text style={styles.suggestedTitle}>Rhu-Bulan, Sorsogon</Text>
            <Text style={styles.suggestedAddress}>
              Benigno S. Aquino (Imelda), Bulan, Sorsogon, 4706, Bicol (Region V), Philippines
            </Text>
          </View>
        </TouchableOpacity>

        {/* Saved Places Section */}
        <View style={styles.savedPlacesSection}>
          <View style={styles.savedPlacesHeader}>
            <Text style={styles.savedPlacesTitle}>Ride to Saved Places</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.savedPlacesGrid}>
            {renderSavedPlace('home', 'Home', () => handleSavedPlacePress('Home'))}
            {renderSavedPlace('briefcase', 'Work', () => handleSavedPlacePress('Work'))}
            {renderSavedPlace('bookmark', 'New', () => handleSavedPlacePress('New'))}
          </View>
        </View>
      </View>


      {/* Debug Section - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Text style={styles.debugText}>
            Debug: isFindingDriver={isFindingDriver.toString()}, 
            hasProcessedPickup={hasProcessedPickup.toString()}, 
            hasPickup={!!selectedPickup}, 
            hasDestination={!!selectedDestination}
          </Text>
        </View>
      )}

      {/* Finding Driver Section */}
      {isFindingDriver && selectedDestination && selectedPickup && (
        <View style={styles.findingDriverSection}>
          <View style={styles.findingDriverContent}>
            <View style={styles.findingDriverIcon}>
              <Ionicons name="search" size={32} color="#58BC6B" />
            </View>
            <Text style={styles.findingDriverTitle}>Finding a Driver</Text>
            <Text style={styles.findingDriverSubtitle}>
              Searching for nearby drivers to {selectedDestination.title}
            </Text>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.loadingDot, { opacity: loadingDotOpacity1 }]} />
              <Animated.View style={[styles.loadingDot, { opacity: loadingDotOpacity2 }]} />
              <Animated.View style={[styles.loadingDot, { opacity: loadingDotOpacity3 }]} />
            </View>
          </View>
          
          {/* Map with Pulsating Markers */}
          <View style={styles.routeMapSection}>
            <View style={styles.routeMapHeader}>
              <Text style={styles.routeMapTitle}>Your Route</Text>
              <Text style={styles.routeMapSubtitle}>
                From {selectedPickup.address} to {selectedDestination.title}
              </Text>
            </View>
            <View style={styles.routeMapContainer}>
              <MapView
                provider="google"
                style={styles.routeMap}
                initialRegion={{
                  latitude: selectedPickup.latitude,
                  longitude: selectedPickup.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                showsScale={false}
                showsBuildings={false}
                showsTraffic={false}
                showsIndoors={false}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                {/* Pickup Location Marker with Pulsating Effect */}
                <Marker
                  coordinate={{
                    latitude: selectedPickup.latitude,
                    longitude: selectedPickup.longitude,
                  }}
                  title="Pickup Location"
                  description={selectedPickup.address}
                >
                  <PulsatingMarker
                    size={16}
                    color="#007AFF"
                    pulseColor="#007AFF"
                    animationDuration={2000}
                    pulseCount={3}
                  />
                </Marker>

                {/* Destination Marker with Pulsating Effect */}
                <Marker
                  coordinate={{
                    latitude: selectedDestination.latitude,
                    longitude: selectedDestination.longitude,
                  }}
                  title="Destination"
                  description={selectedDestination.title}
                >
                  <PulsatingMarker
                    size={16}
                    color="#58BC6B"
                    pulseColor="#58BC6B"
                    animationDuration={2000}
                    pulseCount={3}
                  />
                </Marker>
              </MapView>
            </View>
          </View>
        </View>
      )}

      {/* Booking Confirmation Section */}
      {!isFindingDriver && selectedDestination && selectedPickup && (
        <View style={styles.bookingSection}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Confirm Your Trip</Text>
            <Text style={styles.bookingSubtitle}>Review your pickup and destination</Text>
          </View>
          
          <View style={styles.bookingContent}>
            {/* Location Cards */}
            <View style={styles.locationCardsContainer}>
              {/* Pickup Card */}
              <View style={styles.locationCard}>
                <View style={styles.locationCardHeader}>
                  <View style={styles.locationCardIcon}>
                    <Ionicons name="location" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.locationCardTitle}>Pickup</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('MapSelection', { 
                    isPickupSelection: true,
                    destination: selectedDestination 
                  })}>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.locationCardAddress}>{selectedPickup.address}</Text>
              </View>
              
              {/* Destination Card */}
              <View style={styles.locationCard}>
                <View style={styles.locationCardHeader}>
                  <View style={styles.locationCardIcon}>
                    <Ionicons name="flag" size={16} color="#EF4444" />
                  </View>
                  <Text style={styles.locationCardTitle}>Destination</Text>
                  <TouchableOpacity onPress={() => setIsSearchModalVisible(true)}>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.locationCardAddress}>{selectedDestination.title}</Text>
              </View>
            </View>
            
            {/* Route Map Preview */}
            <View style={styles.routeMapSection}>
              <View style={styles.routeMapHeader}>
                <Text style={styles.routeMapTitle}>Route Preview</Text>
                <Text style={styles.routeMapSubtitle}>
                  From {selectedPickup.address} to {selectedDestination.title}
                </Text>
              </View>
              <View style={styles.routeMapContainer}>
                <MapView
                  provider="google"
                  style={styles.routeMap}
                  initialRegion={{
                    latitude: (selectedPickup.latitude + selectedDestination.latitude) / 2,
                    longitude: (selectedPickup.longitude + selectedDestination.longitude) / 2,
                    latitudeDelta: Math.abs(selectedDestination.latitude - selectedPickup.latitude) * 1.5,
                    longitudeDelta: Math.abs(selectedDestination.longitude - selectedPickup.longitude) * 1.5,
                  }}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  showsCompass={false}
                  showsScale={false}
                  showsBuildings={false}
                  showsTraffic={false}
                  showsIndoors={false}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  {/* Pickup Location Marker */}
                  <Marker
                    coordinate={{
                      latitude: selectedPickup.latitude,
                      longitude: selectedPickup.longitude,
                    }}
                    title="Pickup Location"
                    description={selectedPickup.address}
                  >
                    <View style={styles.staticMarker}>
                      <Ionicons name="location" size={20} color="#007AFF" />
                    </View>
                  </Marker>

                  {/* Destination Marker */}
                  <Marker
                    coordinate={{
                      latitude: selectedDestination.latitude,
                      longitude: selectedDestination.longitude,
                    }}
                    title="Destination"
                    description={selectedDestination.title}
                  >
                    <View style={styles.staticMarker}>
                      <Ionicons name="flag" size={20} color="#58BC6B" />
                    </View>
                  </Marker>
                </MapView>
              </View>
            </View>
            
            {/* Booking Actions */}
            <View style={styles.bookingActions}>
              <TouchableOpacity 
                style={styles.confirmBookingButton}
                onPress={() => {
                  // TODO: Implement booking confirmation logic
                  console.log('Booking confirmed!');
                  setIsFindingDriver(true);
                  
                  // Simulate finding driver after confirmation
                  setTimeout(() => {
                    Alert.alert('Booking Confirmed', 'Your ride request has been sent to nearby drivers.');
                    setIsFindingDriver(false);
                  }, 2000);
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.confirmBookingText}>Confirm Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelBookingButton}
                onPress={() => {
                  setSelectedDestination(null);
                  setSelectedPickup(null);
                  setDestination('');
                  setIsFindingDriver(false);
                  setHasProcessedPickup(false);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#6B7280" />
                <Text style={styles.cancelBookingText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeSearchModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.searchModal, 
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeSearchModal}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <View style={styles.currentLocationHeader}>
                <View style={styles.currentLocationDot} />
                <Text style={styles.currentLocationText}>Current location</Text>
              </View>
              <View style={{ width: 24 }} />
            </View>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <View style={styles.searchInput}>
                <View style={styles.searchDot} />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Where to?"
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={(text) => {
                    setSearchText(text);
                    if (text.trim()) {
                      searchPlacesAPI(text);
                    } else {
                      setSearchResults([]);
                      setSearchError(null);
                    }
                  }}
                  onSubmitEditing={() => {
                    if (searchText.trim()) {
                      searchPlacesAPI(searchText);
                    }
                  }}
                />
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Recent' && styles.activeTab]}
                onPress={() => setActiveTab('Recent')}
              >
                <Text style={[styles.tabText, activeTab === 'Recent' && styles.activeTabText]}>
                  Recent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Suggested' && styles.activeTab]}
                onPress={() => setActiveTab('Suggested')}
              >
                <Text style={[styles.tabText, activeTab === 'Suggested' && styles.activeTabText]}>
                  Suggested
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Saved' && styles.activeTab]}
                onPress={() => setActiveTab('Saved')}
              >
                <Text style={[styles.tabText, activeTab === 'Saved' && styles.activeTabText]}>
                  Saved
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            {searchText.trim() && (
              <ScrollView style={styles.modalContent}>
                {isSearching && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Searching places...</Text>
                  </View>
                )}
                
                {searchError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{searchError}</Text>
                  </View>
                )}
                
                {searchResults.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.locationItem}
                    onPress={() => {
                      if (location.latitude && location.longitude) {
                        const destination = {
                          title: location.name,
                          address: location.address,
                          latitude: location.latitude,
                          longitude: location.longitude,
                        };
                        setSelectedDestination(destination);
                        setDestination(location.name);
                        closeSearchModal();
                        setSearchText('');
                        setSearchResults([]);
                        
                        // Reset pickup processing flag and navigate to map selection
                        setHasProcessedPickup(false);
                        navigation.navigate('MapSelection', { 
                          isPickupSelection: true,
                          destination: destination 
                        });
                      }
                    }}
                  >
                    <Ionicons name="location" size={20} color="#58BC6B" />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationTitle}>{location.name}</Text>
                      <Text style={styles.locationSubtitle}>
                        {location.distance && `${location.distance} • `}{location.address}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
                
                {!isSearching && searchResults.length === 0 && searchText.trim() && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No places found</Text>
                    <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Content */}
            {!searchText.trim() && (
              <ScrollView style={styles.modalContent}>
              {/* Recent Locations */}
              {activeTab === 'Recent' && (
                <View>
                  <View style={styles.locationItem}>
                    <Ionicons name="time" size={20} color="#58BC6B" />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationTitle}>Pin location</Text>
                      <Text style={styles.locationSubtitle}>0.00km • PH Non-serviceable</Text>
                    </View>
                    <Ionicons name="ellipsis-vertical" size={20} color="#999" />
                  </View>
                  
                  <View style={styles.locationItem}>
                    <Ionicons name="time" size={20} color="#58BC6B" />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationTitle}>Rhu-Bulan, Sorsogon</Text>
                      <Text style={styles.locationSubtitle}>
                        6.24km • Benigno S. Aquino (Imelda), Bulan, Sorsogon, 4706, Bicol (Region V), Philippines
                      </Text>
                    </View>
                    <Ionicons name="ellipsis-vertical" size={20} color="#999" />
                  </View>

                  <View style={styles.locationItem}>
                    <Ionicons name="time" size={20} color="#58BC6B" />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationTitle}>Near Masbate-Sisigon-Bulan Road</Text>
                      <Text style={styles.locationSubtitle}>
                        0.01km • N. Roque (Rizal), Bulan, Sorsogon, Bicol (Region V), PH Non-serviceable, Bicol (Region V)...
                      </Text>
                    </View>
                    <Ionicons name="ellipsis-vertical" size={20} color="#999" />
                  </View>

                  <View style={styles.locationItem}>
                    <Ionicons name="time" size={20} color="#58BC6B" />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationTitle}>Near Masbate-Sisigon-Bulan Road</Text>
                      <Text style={styles.locationSubtitle}>
                        0.57km • G. Del Pilar (Tanga), Bulan, Sorsogon, Bicol (Region V), PH Non-serviceable, Bicol (Region V)...
                      </Text>
                    </View>
                    <Ionicons name="ellipsis-vertical" size={20} color="#999" />
                  </View>
                </View>
              )}

              {/* Suggested Locations */}
              {activeTab === 'Suggested' && (
                <View>
                  <Text style={styles.emptyText}>No suggested locations</Text>
                </View>
              )}

              {/* Saved Locations */}
              {activeTab === 'Saved' && (
                <View>
                  <Text style={styles.emptyText}>No saved locations</Text>
                </View>
              )}
            </ScrollView>
            )}

            {/* Bottom Action */}
            <TouchableOpacity style={styles.chooseOnMapButton} onPress={handleChooseOnMap}>
              <Ionicons name="location" size={20} color="black" />
              <Text style={styles.chooseOnMapText}>Choose on DynamicTrike Maps</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#58BC6B',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    minHeight: height * 0.3,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerContent: {
    marginTop: 50,
    marginRight: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  mapButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#58BC6B',
    fontWeight: '600',
    marginLeft: 4,
  },
  illustrationContainer: {
    position: 'absolute',
    right: -20,
    top: 100,
    width: 200,
    height: 160,
    zIndex: 10,
  },
  onboardImage: {
    width: 200,
    height: 160,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  destinationInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  suggestedDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 12,
  },
  suggestedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestedContent: {
    flex: 1,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  suggestedAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  savedPlacesSection: {
    marginTop: 10,
  },
  savedPlacesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  savedPlacesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  savedPlacesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savedPlaceButton: {
    alignItems: 'center',
    flex: 1,
  },
  savedPlaceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  savedPlaceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  searchModal: {
    backgroundColor: 'white',
    height: height,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  currentLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  searchInputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 12,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FEE2E2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#EF4444',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  chooseOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chooseOnMapText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginLeft: 8,
  },
  // Route Map Styles
  routeMapSection: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  routeMapHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeMapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  routeMapSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeMapContainer: {
    height: 400,
    position: 'relative',
  },
  routeMap: {
    width: '100%',
    height: '100%',
  },
  locationCardsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationCardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  locationCardAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 32,
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#58BC6B',
    fontWeight: '500',
  },
  // Search Results Styles
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Booking Section Styles
  bookingSection: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F8F9FA',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  bookingContent: {
    padding: 16,
  },
  bookingActions: {
    marginTop: 16,
    gap: 12,
  },
  confirmBookingButton: {
    backgroundColor: '#58BC6B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBookingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBookingButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelBookingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  // Finding Driver Styles
  findingDriverSection: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  findingDriverContent: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  findingDriverIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  findingDriverTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  findingDriverSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#58BC6B',
    opacity: 0.3,
  },
  // Debug Styles
  debugSection: {
    margin: 20,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  debugText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  // Static Marker Styles
  staticMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
});
