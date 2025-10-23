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
  // Empty activities array - will be populated from real data
  const activities: ActivityItem[] = [];

  const handleRebook = (activity: ActivityItem) => {
    // Handle rebook functionality
    console.log('Rebooking:', activity.destination);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📱</Text>
      <Text style={styles.emptyStateTitle}>No activities yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your ride history will appear here once you start booking rides.
      </Text>
    </View>
  );

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
        
        {activities.length > 0 ? (
          activities.map(renderActivityItem)
        ) : (
          renderEmptyState()
        )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
