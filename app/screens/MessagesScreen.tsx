import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';

export const MessagesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');

  const handleHelpCentre = () => {
    console.log('Navigate to Help Centre');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'chats' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('chats')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'chats' && styles.activeTabButtonText
            ]}>
              Chats
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'notifications' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'notifications' && styles.activeTabButtonText
            ]}>
              Notifications
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration Section */}
        <View style={styles.illustrationContainer}>
          <View style={styles.characterContainer}>
            <Text style={styles.characterEmoji}>👨‍💼</Text>
            <View style={styles.helmetContainer}>
              <Text style={styles.helmetEmoji}>🪖</Text>
            </View>
            <View style={styles.waveContainer}>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
          </View>
        </View>

        {/* Message Content */}
        <View style={styles.messageContainer}>
          <Text style={styles.mainMessage}>
            Find your chats with drivers here!
          </Text>
          
          <Text style={styles.subMessage}>
            You can also get help from them via our{' '}
            <Text style={styles.helpLink} onPress={handleHelpCentre}>
              Help Centre.
            </Text>
          </Text>
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
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#58BC6B',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  characterContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  helmetContainer: {
    position: 'absolute',
    top: 10,
    left: -10,
    backgroundColor: '#FF4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helmetEmoji: {
    fontSize: 20,
  },
  waveContainer: {
    position: 'absolute',
    top: -5,
    right: -15,
  },
  waveEmoji: {
    fontSize: 30,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  subMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  helpLink: {
    color: '#1976D2',
    fontWeight: '600',
  },
});

