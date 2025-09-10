import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    // Animate logo appearance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto finish after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#58BC6B" />
      
      {/* Main Background with Logo */}
      <View style={[styles.background, { height: screenHeight - insets.top - insets.bottom }]}>
        {/* Logo centered on screen */}
        <Animated.View 
          style={[
            styles.logoPosition,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Image 
            source={require('../assets/greenlogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58BC6B',
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  logoPosition: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
});
