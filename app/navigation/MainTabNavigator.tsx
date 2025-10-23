import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { DriverDashboard } from '../screens/DriverDashboard';
import { ActivityScreen } from '../screens/ActivityScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { RootTabParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Custom tab bar component to match your design
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIcon = () => {
          switch (route.name) {
            case 'Home':
              return 'home';
            case 'DriverDashboard':
              return 'car';
            case 'Activity':
              return 'time';
            case 'Account':
              return 'person';
            default:
              return 'home';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={[
              styles.tabIconContainer,
              isFocused && styles.activeTabIconContainer
            ]}>
              <Ionicons 
                name={getIcon() as any}
                size={20}
                color={isFocused ? '#FFFFFF' : '#9CA3AF'}
              />
              {route.name === 'Activity' && (
                <View style={[
                  styles.clockIcon,
                  isFocused && styles.activeClockIcon
                ]}>
                  <Ionicons name="time" size={6} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={[
              styles.tabLabel,
              isFocused && styles.activeTabLabel
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MainTabNavigator = () => {
  const { user } = useAuth();
  const isDriver = user?.role === 'driver';

  // Debug logging
  console.log('[MainTabNavigator] User role:', user?.role);
  console.log('[MainTabNavigator] Is driver:', isDriver);
  console.log('[MainTabNavigator] User email:', user?.email);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {isDriver ? (
        // Driver tabs
        <>
          <Tab.Screen 
            name="DriverDashboard" 
            component={DriverDashboard}
            options={{ tabBarLabel: 'Drive' }}
          />
          <Tab.Screen 
            name="Activity" 
            component={ActivityScreen}
            options={{ tabBarLabel: 'Activity' }}
          />
          <Tab.Screen 
            name="Account" 
            component={AccountScreen}
            options={{ tabBarLabel: 'Account' }}
          />
        </>
      ) : (
        // Passenger tabs
        <>
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ tabBarLabel: 'Home' }}
          />
          <Tab.Screen 
            name="Activity" 
            component={ActivityScreen}
            options={{ tabBarLabel: 'Activity' }}
          />
          <Tab.Screen 
            name="Account" 
            component={AccountScreen}
            options={{ tabBarLabel: 'Account' }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabIconContainer: {
    backgroundColor: '#58BC6B',
    borderRadius: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#58BC6B',
    fontWeight: '600',
  },
  clockIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#9CA3AF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeClockIcon: {
    backgroundColor: '#58BC6B',
  },
});
