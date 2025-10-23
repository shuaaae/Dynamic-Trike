import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { clearDevUser, isDevMode } from '../lib/devAuth';
import { register } from '../lib/firebaseAuth';
import { driverApi } from '../lib/firebaseDb';

interface DevSettingsScreenProps {
  navigation: any;
}

export const DevSettingsScreen: React.FC<DevSettingsScreenProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const [devModeEnabled, setDevModeEnabled] = useState(isDevMode());
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleToggleDevMode = () => {
    if (devModeEnabled) {
      Alert.alert(
        'Disable Development Mode',
        'This will clear the auto-login and require you to log in normally. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await clearDevUser();
              setDevModeEnabled(false);
              Alert.alert('Development mode disabled', 'You will need to log in normally now.');
            },
          },
        ]
      );
    } else {
      setDevModeEnabled(true);
      Alert.alert('Development mode enabled', 'Auto-login will be active on next app restart.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Clear Storage',
      'This will clear all stored data and require you to log in again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearDevUser();
            Alert.alert('Storage cleared', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleCreateTestDriver = async () => {
    Alert.alert(
      'Create Test Driver Account',
      'This will create a real Firebase account that you can use to login and test the driver features. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Account',
          onPress: async () => {
            setIsCreatingAccount(true);
            try {
              // Test driver credentials
              const testDriverCredentials = {
                email: 'driver@test.com',
                password: 'testdriver123',
                passwordConfirm: 'testdriver123',
                name: 'Test Driver',
                username: 'testdriver',
                role: 'driver' as const,
                phone: '+1234567890'
              };

              // Create Firebase Auth account
              const authUser = await register(testDriverCredentials);
              console.log('Test driver account created:', authUser.email);

              // Create driver profile
              await driverApi.createDriverProfile({
                vehicle_no: 'ABC-123'
              });

              // Update driver profile with additional details
              const driverProfile = await driverApi.getMyDriverProfile();
              if (driverProfile) {
                await driverApi.updateDriverProfile(driverProfile.id, {
                  licenseNumber: 'DL123456789',
                  licenseExpiry: '2025-12-31',
                  verificationStatus: 'approved',
                  verified: true,
                  submittedAt: new Date().toISOString(),
                  reviewedAt: new Date().toISOString()
                });
              }

              Alert.alert(
                'Test Driver Account Created!',
                `Email: ${testDriverCredentials.email}\nPassword: ${testDriverCredentials.password}\n\nYou can now login with these credentials.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Logout current user and navigate to login
                      logout();
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('Error creating test driver:', error);
              if (error.code === 'auth/email-already-in-use') {
                Alert.alert(
                  'Account Already Exists',
                  `The test driver account already exists!\n\nEmail: driver@test.com\nPassword: testdriver123\n\nYou can login with these credentials.`
                );
              } else {
                Alert.alert('Error', `Failed to create test driver account: ${error.message}`);
              }
            } finally {
              setIsCreatingAccount(false);
            }
          },
        },
      ]
    );
  };

  if (!isDevMode()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Development Settings</Text>
          <Text style={styles.message}>This screen is only available in development mode.</Text>
          <TouchableOpacity style={styles.button} onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('AuthOptions');
            }
          }}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('AuthOptions');
          }
        }}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Development Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto-Login</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Development Mode</Text>
            <Switch
              value={devModeEnabled}
              onValueChange={handleToggleDevMode}
              trackColor={{ false: '#767577', true: '#58BC6B' }}
              thumbColor={devModeEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.settingDescription}>
            When enabled, automatically logs you in with a test account on app startup.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Account</Text>
          <TouchableOpacity 
            style={[styles.createButton, isCreatingAccount && styles.buttonDisabled]} 
            onPress={handleCreateTestDriver}
            disabled={isCreatingAccount}
          >
            {isCreatingAccount ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.createButtonText}>Creating Account...</Text>
              </View>
            ) : (
              <Text style={styles.createButtonText}>Create Test Driver Account</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.settingDescription}>
            Creates a real Firebase account with driver role and approved verification status.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleClearStorage}>
            <Text style={styles.actionButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Development Info</Text>
          <Text style={styles.infoText}>
            • Auto-login uses a test driver account{'\n'}
            • Data is stored locally in AsyncStorage{'\n'}
            • Changes take effect on next app restart
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#58BC6B',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#58BC6B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#58BC6B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
