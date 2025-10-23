import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Vibration,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export const MapScreen = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0, // Will be updated when location is found
    longitude: 0,
    latitudeDelta: 0.005, // Close zoom level for detailed view
    longitudeDelta: 0.005,
  });
  const [followUserLocation, setFollowUserLocation] = useState(true);
  const [isZooming, setIsZooming] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Always get and center on user's current location when map opens
    getCurrentLocation(true);
  }, []);

  const getCurrentLocation = async (shouldCenterMap = true) => {
    try {
      setLoading(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location on the map.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Optimized location strategy for Android performance
      let location;
      const timeoutDuration = 8000; // Reduced timeout for faster response
      
      try {
        // First try: High accuracy (faster than BestForNavigation on Android)
        console.log('Trying High accuracy location...');
        const highAccuracyPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5 second interval
          distanceInterval: 10, // 10 meter interval
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location request timed out')), timeoutDuration)
        );

        location = await Promise.race([highAccuracyPromise, timeoutPromise]);
        console.log('High accuracy location obtained');
      } catch (error) {
        console.log('High accuracy failed, trying Balanced accuracy...');
        try {
          // Second try: Balanced accuracy (faster fallback)
          const balancedPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000, // 3 second interval
            distanceInterval: 5, // 5 meter interval
          });
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location request timed out')), timeoutDuration)
          );

          location = await Promise.race([balancedPromise, timeoutPromise]);
          console.log('Balanced accuracy location obtained');
        } catch (fallbackError) {
          console.log('Balanced accuracy failed, trying last known location...');
          // Final fallback: Last known location (fastest)
          const lastKnownLocation = await Location.getLastKnownPositionAsync();
          
          if (lastKnownLocation) {
            location = lastKnownLocation;
            console.log('Last known location obtained');
          } else {
            throw new Error('Unable to get location');
          }
        }
      }

      const locationData: LocationData = {
        latitude: (location as any).coords.latitude,
        longitude: (location as any).coords.longitude,
        accuracy: (location as any).coords.accuracy,
      };

      console.log('Location obtained:', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: new Date().toISOString()
      });

      setLocation(locationData);
      
      // Always update map region with user's location
      const newRegion = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        latitudeDelta: 0.005, // Close zoom level for detailed view
        longitudeDelta: 0.005,
      };
      setMapRegion(newRegion);
      
      // Always center the map when location is found, especially on initial load
      if (shouldCenterMap || isInitialLoad) {
        centerMapOnLocation(locationData.latitude, locationData.longitude, 0.005);
        setFollowUserLocation(true);
        setLocationSet(true);
        setIsInitialLoad(false); // Mark initial load as complete
      }
    } catch (err) {
      console.error('Error getting location:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to get current location: ${errorMessage}`);
      
      // Set a fallback location (Bulan, Sorsogon based on your coordinates)
      const fallbackRegion = {
        latitude: 12.663276,
        longitude: 123.930705,
        latitudeDelta: 0.005, // Close zoom level for detailed view
        longitudeDelta: 0.005,
      };
      setMapRegion(fallbackRegion);
      
      Alert.alert(
        'Location Error',
        `Unable to get your current location. ${errorMessage}. Showing default location.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    // Add haptic feedback
    Vibration.vibrate(50); // Short vibration
    setIsZooming(true);
    
    if (location) {
      // If we already have location, zoom to it immediately
      centerMapOnLocation(location.latitude, location.longitude, 0.005); // Closer zoom
      setFollowUserLocation(true);
      
      // Reset zooming state after animation
      setTimeout(() => {
        setIsZooming(false);
      }, 1000);
    } else {
      // If no location yet, get it first with optimized settings
      setLocationSet(false); // Reset flag to allow centering
      setIsInitialLoad(true); // Reset initial load flag
      
      // Use a faster location strategy for refresh
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        // Try last known location first (fastest)
        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (lastKnownLocation) {
          const locationData: LocationData = {
            latitude: lastKnownLocation.coords.latitude,
            longitude: lastKnownLocation.coords.longitude,
            accuracy: lastKnownLocation.coords.accuracy,
          };
          
          setLocation(locationData);
          centerMapOnLocation(locationData.latitude, locationData.longitude, 0.005);
          setFollowUserLocation(true);
          setLocationSet(true);
          setIsInitialLoad(false);
          setIsZooming(false);
          setLoading(false);
          return;
        }

        // If no last known location, get current with balanced accuracy
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000, // 2 second interval for faster response
          distanceInterval: 5,
        });

        const locationData: LocationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        };
        
        setLocation(locationData);
        centerMapOnLocation(locationData.latitude, locationData.longitude, 0.005);
        setFollowUserLocation(true);
        setLocationSet(true);
        setIsInitialLoad(false);
        setIsZooming(false);
        setLoading(false);
      } catch (error) {
        console.log('Refresh location failed:', error);
        setIsZooming(false);
        setLoading(false);
        // Fallback to full location request
        getCurrentLocation(true);
      }
    }
  };

  const centerMapOnLocation = (lat: number, lng: number, zoomLevel: number = 0.01) => {
    if (mapRef.current) {
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      };
      
      // Update the region state for initial region
      setMapRegion(newRegion);
      
      // Animate to the new region
      mapRef.current.animateToRegion(newRegion, 1000);
      setMapInitialized(true);
    }
  };

  const updateLocationOnly = () => {
    getCurrentLocation(false); // Update location without centering map
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58BC6B" />
        <Text style={styles.loadingText}>Getting your location...</Text>
        <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        onRegionChangeComplete={(region) => {
          if (mapInitialized) {
            setFollowUserLocation(false);
          }
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            description={`Accuracy: ${location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}`}
            pinColor="#58BC6B"
          />
        )}
      </MapView>

      {/* Location Info Overlay */}
      {location && (
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>Your Location</Text>
            {followUserLocation && (
              <View style={styles.followingIndicator}>
                <Ionicons name="locate" size={12} color="#58BC6B" />
                <Text style={styles.followingText}>Following</Text>
              </View>
            )}
          </View>
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {location.longitude.toFixed(6)}
          </Text>
          {location.accuracy && (
            <Text style={styles.accuracyText}>
              Accuracy: ±{Math.round(location.accuracy)}m
            </Text>
          )}
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity 
        style={[
          styles.refreshButton,
          isZooming && styles.refreshButtonZooming
        ]} 
        onPress={refreshLocation}
        activeOpacity={0.8}
        disabled={loading}
      >
        <View style={styles.refreshButtonContent}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons 
                name={isZooming ? "locate" : "locate"} 
                size={isZooming ? 24 : 20} 
                color="#FFFFFF" 
              />
              <Ionicons 
                name="add" 
                size={isZooming ? 14 : 12} 
                color="#FFFFFF" 
                style={styles.zoomIcon} 
              />
            </>
          )}
        </View>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#58BC6B',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#58BC6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  followingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingText: {
    fontSize: 10,
    color: '#58BC6B',
    fontWeight: '600',
    marginLeft: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#58BC6B',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButtonZooming: {
    backgroundColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
  },
  refreshButtonContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 1,
  },
});
