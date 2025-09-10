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
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  id: string;
  title: string;
  onPress: () => void;
}

export const AccountScreen: React.FC = () => {
  const { user } = useAuth();

  const handleRecoveryEmail = () => {
    console.log('Set up recovery email');
  };

  const handlePaymentMethods = () => {
    console.log('Payment Methods');
  };

  const handleSavedPlaces = () => {
    console.log('Saved Places');
  };

  const handleEmergencyContacts = () => {
    console.log('Emergency contacts');
  };

  const handleHelpCentre = () => {
    console.log('Help Centre');
  };

  const handleSettings = () => {
    console.log('Settings');
  };

  const myAccountItems: MenuItem[] = [
    { id: '1', title: 'Payment Methods', onPress: handlePaymentMethods },
    { id: '2', title: 'Saved Places', onPress: handleSavedPlaces },
    { id: '3', title: 'Emergency contacts', onPress: handleEmergencyContacts },
  ];

  const generalItems: MenuItem[] = [
    { id: '1', title: 'Help Centre', onPress: handleHelpCentre },
    { id: '2', title: 'Settings', onPress: handleSettings },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Joshua Godalle'}</Text>
        </View>

        {/* Recovery Email Prompt */}
        <TouchableOpacity style={styles.recoveryEmailCard} onPress={handleRecoveryEmail}>
          <View style={styles.recoveryEmailContent}>
            <Text style={styles.envelopeIcon}>✉️</Text>
            <View style={styles.recoveryEmailText}>
              <Text style={styles.recoveryEmailTitle}>
                Let's make sure you never lose access to your account.
              </Text>
              <Text style={styles.recoveryEmailLink}>Set up recovery email</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* My Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My account</Text>
          {myAccountItems.map(renderMenuItem)}
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          {generalItems.map(renderMenuItem)}
        </View>
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
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFB6C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 50,
    color: '#666',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  recoveryEmailCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  recoveryEmailContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  envelopeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recoveryEmailText: {
    flex: 1,
  },
  recoveryEmailTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  recoveryEmailLink: {
    fontSize: 16,
    color: '#58BC6B',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
});
