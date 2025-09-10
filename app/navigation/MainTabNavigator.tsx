import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { AccountScreen } from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

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
              return '🏠';
            case 'Activity':
              return '📄';
            case 'Messages':
              return '💬';
            case 'Account':
              return '👤';
            default:
              return '🏠';
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
              isFocused && route.name !== 'Activity' && route.name !== 'Account' && styles.activeTabIconContainer
            ]}>
              <Text style={[
                styles.tabIcon,
                isFocused && route.name !== 'Activity' && route.name !== 'Account' && styles.activeTabIcon
              ]}>
                {getIcon()}
              </Text>
              {route.name === 'Activity' && (
                <View style={styles.clockIcon}>
                  <Text style={styles.clockHand}>🕐</Text>
                </View>
              )}
              {route.name === 'Messages' && (
                <View style={styles.messageBadge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.tabLabel,
              isFocused && route.name !== 'Activity' && route.name !== 'Account' && styles.activeTabLabel
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
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
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
        name="Messages" 
        component={MessagesScreen}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{ tabBarLabel: 'Account' }}
      />
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
  tabIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  activeTabIcon: {
    color: '#FFFFFF',
    fontSize: 18,
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
  clockHand: {
    fontSize: 6,
    color: '#FFFFFF',
  },
  messageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
