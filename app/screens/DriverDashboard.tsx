import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

interface DriverDashboardProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [driverLocation, setDriverLocation] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const insets = useSafeAreaInsets();

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const toggleAutoAccept = () => {
    setAutoAccept(!autoAccept);
  };

  // Request location permission and get current location
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          const location = await Location.getCurrentPositionAsync({});
          setDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    };

    requestLocationPermission();
  }, []);

  // Set up location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (locationPermission) {
      locationSubscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          setDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationPermission]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          mapType="standard"
          followsUserLocation={true}
        >
          {/* Driver location marker */}
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Your Location"
            description="Driver location"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={20} color="white" />
            </View>
          </Marker>
        </MapView>

        {/* Floating Top Elements */}
        <View style={styles.floatingTopBar}>
          <TouchableOpacity style={styles.earningsButton}>
            <Ionicons name="bar-chart" size={16} color="#374151" />
            <Text style={styles.earningsText}>Earnings</Text>
          </TouchableOpacity>
          
          <View style={styles.profileSection}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>5.00</Text>
            </View>
            <Image 
              source={{ uri: 'https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=JD' }}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* Floating Power Button */}
        <TouchableOpacity 
          style={[styles.powerButton, isOnline && styles.powerButtonActive]}
          onPress={toggleOnlineStatus}
        >
          <Ionicons 
            name="power" 
            size={24} 
            color={isOnline ? "white" : "#6B7280"} 
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Status and Action Card */}
      <View style={styles.bottomCard}>
        {/* Online Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, isOnline && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {isOnline ? "You're online." : "You're offline."}
          </Text>
        </View>

        {/* Action Icons Row */}
        <View style={styles.actionIconsRow}>
          <TouchableOpacity 
            style={[styles.actionIcon, autoAccept && styles.actionIconActive]}
            onPress={toggleAutoAccept}
          >
            <View style={[styles.iconCircle, autoAccept && styles.iconCircleActive]}>
              <Ionicons 
                name="flash" 
                size={20} 
                color={autoAccept ? "#58BC6B" : "#6B7280"} 
              />
            </View>
            <Text style={[styles.iconLabel, autoAccept && styles.iconLabelActive]}>
              Auto Accept
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIcon}>
            <View style={styles.iconCircle}>
              <Ionicons name="car" size={20} color="#6B7280" />
            </View>
            <Text style={styles.iconLabel}>Service Types</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIcon}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield" size={20} color="#6B7280" />
            </View>
            <Text style={styles.iconLabel}>Safety Center</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIcon}>
            <View style={styles.iconCircle}>
              <Ionicons name="construct" size={20} color="#6B7280" />
            </View>
            <Text style={styles.iconLabel}>Diagnostic</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingTopBar: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  earningsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#58BC6B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  powerButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  powerButtonActive: {
    backgroundColor: '#58BC6B',
  },
  bottomCard: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  statusDotActive: {
    backgroundColor: '#58BC6B',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  actionIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionIcon: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconActive: {
    // Additional styling for active state if needed
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: '#F0FDF4',
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  iconLabelActive: {
    color: '#58BC6B',
  },
});
