import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchScreenNavigationProp } from '../types/navigation';
import { searchPlaces, fallbackSearch, PlaceResult } from '../services/googlePlacesService';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

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

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'suggested' | 'saved'>('recent');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Loading animation effect
  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createAnimation(dot1, 0),
        createAnimation(dot2, 200),
        createAnimation(dot3, 400),
      ]).start();
    };

    if (isLoading) {
      animateDots();
    }

    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, dot1, dot2, dot3]);

  const recentLocations: LocationItem[] = [
    {
      id: '1',
      name: 'Near Masbate-Sisigon-Bulan Road',
      address: '0.57km • G. Del Pilar (Tanga), Bulan, Sorsogon, Bicol (Region V), PH Non-serviceable, Bicol (Region V), Sors...',
      distance: '0.57km',
      type: 'recent'
    },
    {
      id: '2',
      name: 'Pin location',
      address: '0.00km • PH Non-serviceable',
      distance: '0.00km',
      type: 'recent'
    },
    {
      id: '3',
      name: 'Near Masbate-Sisigon-Bulan Road',
      address: '0.01km • N. Roque (Rizal), Bulan, Sorsogon, Bicol (Region V), PH Non-serviceable, Bicol (Region V), Sors...',
      distance: '0.01km',
      type: 'recent'
    }
  ];

  const suggestedLocations: LocationItem[] = [
    {
      id: '4',
      name: 'Bulan Public Market',
      address: '0.8km • Market Street, Bulan, Sorsogon',
      distance: '0.8km',
      type: 'suggested'
    },
    {
      id: '5',
      name: 'Bulan Municipal Hall',
      address: '1.2km • Government Center, Bulan, Sorsogon',
      distance: '1.2km',
      type: 'suggested'
    }
  ];

  const savedLocations: LocationItem[] = [
    {
      id: '6',
      name: 'Home',
      address: '2.1km • Your Home Address',
      distance: '2.1km',
      type: 'saved'
    },
    {
      id: '7',
      name: 'Work',
      address: '5.3km • Your Work Address',
      distance: '5.3km',
      type: 'saved'
    }
  ];

  const getCurrentLocations = () => {
    switch (activeTab) {
      case 'recent':
        return recentLocations;
      case 'suggested':
        return suggestedLocations;
      case 'saved':
        return savedLocations;
      default:
        return recentLocations;
    }
  };

  const handleLocationSelect = (location: LocationItem) => {
    // Handle location selection
    console.log('Selected location:', location);
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleTabChange = (tab: 'recent' | 'suggested' | 'saved') => {
    setActiveTab(tab);
    if (tab === 'recent') {
      setIsLoading(true);
    }
  };

  // Get user location for distance calculation
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.log('Error getting location:', error);
      return null;
    }
  };

  // Real search function using Google Places API
  const searchPlacesAPI = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Get user location if not already available
      let currentLocation = userLocation;
      if (!currentLocation) {
        currentLocation = await getUserLocation();
        if (currentLocation) {
          setUserLocation(currentLocation);
        }
      }

      // Call Google Places API
      const results = await searchPlaces(query, currentLocation || undefined);
      
      // Transform results to LocationItem format
        const locationItems: LocationItem[] = results.map((place: PlaceResult) => ({
          id: place.id,
          name: place.name,
          address: place.address,
          distance: place.distance || 'N/A',
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
    } catch (error: any) {
      console.error('Search error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Search failed. Please try again.';
      
      if (error.message === 'API_KEY_NOT_CONFIGURED') {
        errorMessage = 'Google Places API key not configured. Using demo mode.';
      } else if (error.message === 'API_KEY_INVALID') {
        errorMessage = 'Google Places API key invalid. Using demo mode.';
      } else if (error.message === 'QUOTA_EXCEEDED') {
        errorMessage = 'Search quota exceeded. Using demo mode.';
      } else if (error.message?.startsWith('API_ERROR_')) {
        errorMessage = 'Search service temporarily unavailable. Using demo mode.';
      }
      
      // Fallback to demo search
      try {
        const fallbackResults = await fallbackSearch(query);
        const locationItems: LocationItem[] = fallbackResults.map((place: PlaceResult) => ({
          id: place.id,
          name: place.name,
          address: place.address,
          distance: place.distance || 'N/A',
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
        setSearchError(errorMessage);
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search text change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim()) {
        searchPlacesAPI(searchText);
      } else {
        setSearchResults([]);
        setIsSearching(false);
        setSearchError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const renderLoadingDots = () => (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.loadingDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.loadingDot, { opacity: dot3 }]} />
    </View>
  );

  const renderLocationItem = (location: LocationItem) => {
    const getPlaceTypeIcon = (types?: string[]) => {
      if (!types || types.length === 0) return "location";
      
      // Food & Dining
      if (types.includes('restaurant') || types.includes('food') || types.includes('meal_takeaway') || types.includes('meal_delivery')) return "restaurant";
      if (types.includes('cafe') || types.includes('coffee_shop')) return "cafe";
      if (types.includes('bar') || types.includes('night_club')) return "wine";
      
      // Health & Medical
      if (types.includes('hospital') || types.includes('health') || types.includes('medical_clinic')) return "medical";
      if (types.includes('pharmacy') || types.includes('drugstore')) return "medical";
      if (types.includes('dentist') || types.includes('doctor')) return "medical";
      
      // Education
      if (types.includes('school') || types.includes('university') || types.includes('college')) return "school";
      if (types.includes('library')) return "library";
      
      // Financial
      if (types.includes('bank') || types.includes('atm') || types.includes('finance')) return "card";
      if (types.includes('insurance_agency')) return "card";
      
      // Transportation
      if (types.includes('gas_station') || types.includes('fuel')) return "car";
      if (types.includes('airport') || types.includes('bus_station') || types.includes('train_station') || types.includes('subway_station')) return "airplane";
      if (types.includes('parking')) return "car";
      
      // Shopping
      if (types.includes('shopping_mall') || types.includes('store') || types.includes('supermarket') || types.includes('grocery_or_supermarket')) return "storefront";
      if (types.includes('clothing_store') || types.includes('shoe_store')) return "shirt";
      if (types.includes('electronics_store') || types.includes('computer_store')) return "phone-portrait";
      
      // Services
      if (types.includes('pharmacy') || types.includes('drugstore')) return "medical";
      if (types.includes('beauty_salon') || types.includes('hair_care')) return "cut";
      if (types.includes('laundry') || types.includes('dry_cleaning')) return "shirt";
      
      // Government & Public
      if (types.includes('police') || types.includes('fire_station') || types.includes('courthouse')) return "shield";
      if (types.includes('post_office')) return "mail";
      if (types.includes('embassy')) return "business";
      
      // Recreation
      if (types.includes('park') || types.includes('zoo') || types.includes('aquarium')) return "leaf";
      if (types.includes('gym') || types.includes('fitness') || types.includes('sports_complex')) return "fitness";
      if (types.includes('movie_theater') || types.includes('cinema')) return "film";
      if (types.includes('museum') || types.includes('art_gallery')) return "images";
      
      // Accommodation
      if (types.includes('hotel') || types.includes('lodging') || types.includes('motel')) return "bed";
      
      // Religious
      if (types.includes('church') || types.includes('mosque') || types.includes('temple') || types.includes('synagogue')) return "home";
      
      // Entertainment
      if (types.includes('amusement_park') || types.includes('casino')) return "happy";
      if (types.includes('bowling_alley') || types.includes('arcade')) return "game-controller";
      
      // Utilities
      if (types.includes('electrician') || types.includes('plumber') || types.includes('locksmith')) return "construct";
      
      return "location";
    };

    const getPriceLevelText = (priceLevel?: number) => {
      if (!priceLevel) return '';
      const symbols = ['', '$', '$$', '$$$', '$$$$'];
      return symbols[priceLevel] || '';
    };

    const getBusinessStatusColor = (status?: string) => {
      switch (status) {
        case 'OPERATIONAL': return '#10B981';
        case 'CLOSED_TEMPORARILY': return '#F59E0B';
        case 'CLOSED_PERMANENTLY': return '#EF4444';
        default: return '#6B7280';
      }
    };

    return (
      <TouchableOpacity
        key={location.id}
        style={styles.locationItem}
        onPress={() => handleLocationSelect(location)}
      >
        <View style={[
          styles.locationIcon,
          location.type === 'recent' && styles.recentLocationIcon,
          location.type === 'suggested' && styles.searchLocationIcon
        ]}>
          <Ionicons 
            name={
              location.type === 'recent' ? 'time' : 
              location.type === 'suggested' ? getPlaceTypeIcon(location.types) : 
              'bookmark'
            } 
            size={16} 
            color="white" 
          />
        </View>
        <View style={styles.locationContent}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationName} numberOfLines={1}>
              {location.name}
            </Text>
            {location.businessStatus && (
              <View style={[
                styles.businessStatus,
                { backgroundColor: getBusinessStatusColor(location.businessStatus) }
              ]}>
                <Text style={styles.businessStatusText}>
                  {location.businessStatus === 'OPERATIONAL' ? 'Open' : 
                   location.businessStatus === 'CLOSED_TEMPORARILY' ? 'Closed' : 'Permanently Closed'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.locationAddress} numberOfLines={2}>
            {location.address}
          </Text>
          
          {/* Address Components */}
          {location.addressComponents && (
            <View style={styles.addressComponents}>
              {location.addressComponents.zone && (
                <Text style={styles.addressComponent}>Zone: {location.addressComponents.zone}</Text>
              )}
              {location.addressComponents.purok && (
                <Text style={styles.addressComponent}>Purok: {location.addressComponents.purok}</Text>
              )}
              {location.addressComponents.street && (
                <Text style={styles.addressComponent}>Street: {location.addressComponents.street}</Text>
              )}
              {location.addressComponents.route && (
                <Text style={styles.addressComponent}>Route: {location.addressComponents.route}</Text>
              )}
              {location.addressComponents.barangay && (
                <Text style={styles.addressComponent}>Barangay: {location.addressComponents.barangay}</Text>
              )}
              {location.addressComponents.city && (
                <Text style={styles.addressComponent}>City: {location.addressComponents.city}</Text>
              )}
              {location.addressComponents.province && (
                <Text style={styles.addressComponent}>Province: {location.addressComponents.province}</Text>
              )}
              {location.addressComponents.postalCode && (
                <Text style={styles.addressComponent}>Postal Code: {location.addressComponents.postalCode}</Text>
              )}
            </View>
          )}
          
          <View style={styles.locationFooter}>
            {location.distance && (
              <Text style={styles.locationDistance}>{location.distance}</Text>
            )}
            {location.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {location.rating.toFixed(1)} ({location.userRatingCount || 0})
                </Text>
              </View>
            )}
            {location.priceLevel && (
              <Text style={styles.priceLevel}>{getPriceLevelText(location.priceLevel)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <View style={styles.redDot} />
            <TextInput
              style={styles.searchInput}
              placeholder="To"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchText('')}
              >
                <Ionicons name="close" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => handleTabChange('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggested' && styles.activeTab]}
          onPress={() => handleTabChange('suggested')}
        >
          <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTabText]}>
            Suggested
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => handleTabChange('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isSearching ? (
          renderLoadingDots()
        ) : searchText.trim() ? (
          <>
            {searchError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{searchError}</Text>
                {(searchError.includes('API key not configured') || searchError.includes('API key invalid')) && (
                  <TouchableOpacity 
                    style={styles.setupButton}
                    onPress={() => {
                      Alert.alert(
                        'Setup Google Places API',
                        'To enable real search results:\n\n1. Get API key from Google Cloud Console\n2. Enable Places API\n3. Update app/config/googlePlaces.ts\n\nSee GOOGLE_PLACES_SETUP.md for details.',
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.setupButtonText}>Setup Instructions</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {searchResults.length > 0 ? (
              searchResults.map(renderLocationItem)
            ) : !isSearching && searchText.trim() && !searchError ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No results found for "{searchText}"</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            ) : null}
          </>
        ) : isLoading && activeTab === 'recent' ? (
          renderLoadingDots()
        ) : (
          getCurrentLocations().map(renderLocationItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#F0F0F0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentLocationIcon: {
    backgroundColor: '#58BC6B',
  },
  searchLocationIcon: {
    backgroundColor: '#666',
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 3,
  },
  errorContainer: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0EA5E9',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  errorText: {
    color: '#0369A1',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  setupButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'center',
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  businessStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  addressComponents: {
    marginTop: 4,
    marginBottom: 4,
  },
  addressComponent: {
    fontSize: 11,
    color: '#666',
    marginBottom: 1,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  priceLevel: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 8,
  },
  locationDistance: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});
