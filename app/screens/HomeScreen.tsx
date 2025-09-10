import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const popularDestinations = [
    { name: 'Ace Hardware Sleman', address: 'Jl. Merdeka TP 886' },
    { name: 'Slab Design Studio', address: 'Jl. Merpati 86L, Condong Catur' },
    { name: 'GOR Marga Jaya', address: 'Jl. Talem 86L, Maguwo Hario' },
  ];

  const savedAddresses = [
    { name: 'Home', icon: '🏠' },
    { name: 'Alfamart', icon: '🏪' },
    { name: 'Kantor', icon: '🏢' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Green Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>
                {getGreeting()}, {user?.name || 'User'}
              </Text>
              <Text style={styles.subtitleText}>Embark your new journey</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Map</Text>
            <Text style={styles.mapIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>
        
        {/* Travel Illustrations Background - Optimized */}
        <View style={styles.illustrationsContainer}>
          {/* Decorative elements instead of heavy images */}
          <View style={styles.decorativeElement1}>
            <Text style={styles.decorativeIcon}>🎒</Text>
          </View>
          <View style={styles.decorativeElement2}>
            <Text style={styles.decorativeIcon}>📷</Text>
          </View>
          <View style={styles.decorativeElement3}>
            <Text style={styles.decorativeIcon}>🗺️</Text>
          </View>
          <View style={styles.decorativeElement4}>
            <Text style={styles.decorativeIcon}>🧭</Text>
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.contentContainer}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>📍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Where to?"
            placeholderTextColor="#999"
          />
          <Text style={styles.searchButton}>🔍</Text>
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular destinations</Text>
            <Text style={styles.sectionArrow}>→</Text>
          </View>
          {popularDestinations.map((destination, index) => (
            <TouchableOpacity key={index} style={styles.destinationCard}>
              <Text style={styles.destinationIcon}>📍</Text>
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>{destination.name}</Text>
                <Text style={styles.destinationAddress}>{destination.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Saved Addresses */}
        <View style={styles.section}>
          <View style={styles.savedAddressHeader}>
            <View>
              <Text style={styles.sectionTitle}>Saved addresses</Text>
              <Text style={styles.savedAddressSubtitle}>Never Forget an Address Again!</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
              <Text style={styles.addButtonLabel}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.savedAddressScroll}
            removeClippedSubviews={true}
            decelerationRate="fast"
            snapToInterval={100}
            snapToAlignment="start"
          >
            {savedAddresses.map((address, index) => (
              <TouchableOpacity key={index} style={styles.savedAddressButton}>
                <Text style={styles.savedAddressIcon}>{address.icon}</Text>
                <Text style={styles.savedAddressName}>{address.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff', // White background for content area
  },
  header: {
    backgroundColor: '#58BC6B',
    paddingTop: 50, // Increased to account for status bar
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mapButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  mapIcon: {
    fontSize: 16,
  },
  illustrationsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorativeElement1: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeElement2: {
    position: 'absolute',
    top: 80,
    right: 80,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeElement3: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeElement4: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    fontSize: 18,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionArrow: {
    fontSize: 18,
    color: '#58BC6B',
    fontWeight: 'bold',
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  destinationIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: '#666',
  },
  savedAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  savedAddressSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#58BC6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  addButtonLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  savedAddressScroll: {
    marginTop: 8,
  },
  savedAddressButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 80,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  savedAddressIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  savedAddressName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});
