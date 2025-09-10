import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';

interface ActivityItem {
  id: string;
  destination: string;
  date: string;
  time: string;
  price: string;
}

export const ActivityScreen: React.FC = () => {
  // Sample activity data matching the image
  const activities: ActivityItem[] = [
    {
      id: '1',
      destination: 'Ride to Asilo de San Vicente de Paul',
      date: '17 Aug 2025',
      time: '06:27 AM',
      price: 'P68.00',
    },
    {
      id: '2',
      destination: 'Ride to 381-C Dayao St, Brgy. 133, Tondo',
      date: '16 Aug 2025',
      time: '11:23 PM',
      price: 'P63.00',
    },
    {
      id: '3',
      destination: 'Ride to Blk 3F Lot 10 Phase 3, Barangay 14, Caloocan City',
      date: '15 Aug 2025',
      time: '12:08 PM',
      price: 'P63.00',
    },
    {
      id: '4',
      destination: 'Ride to 381-C Dayao St, Brgy. 133, Tondo',
      date: '14 Aug 2025',
      time: '09:45 PM',
      price: 'P63.00',
    },
    {
      id: '5',
      destination: 'Ride to Blk 3F Lot 10 Phase 3, Barangay 14, Caloocan City',
      date: '13 Aug 2025',
      time: '05:55 PM',
      price: 'P63.00',
    },
  ];

  const handleRebook = (activity: ActivityItem) => {
    // Handle rebook functionality
    console.log('Rebooking:', activity.destination);
  };

  const renderActivityItem = (activity: ActivityItem) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Text style={styles.motorcycleIcon}>🏍️</Text>
      </View>
      
      <View style={styles.activityContent}>
        <Text style={styles.destinationText}>{activity.destination}</Text>
        <Text style={styles.dateTimeText}>
          {activity.date}, {activity.time}
        </Text>
        <TouchableOpacity 
          style={styles.rebookButton}
          onPress={() => handleRebook(activity)}
        >
          <Text style={styles.rebookText}>Rebook</Text>
          <Text style={styles.rebookArrow}>→</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{activity.price}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Recent</Text>
        
        {activities.map(renderActivityItem)}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  motorcycleIcon: {
    fontSize: 20,
    color: 'white',
  },
  activityContent: {
    flex: 1,
    marginRight: 12,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  rebookText: {
    fontSize: 14,
    color: '#58BC6B',
    fontWeight: '600',
    marginRight: 4,
  },
  rebookArrow: {
    fontSize: 14,
    color: '#58BC6B',
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
