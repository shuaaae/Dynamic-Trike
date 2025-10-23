import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PulsatingMarkerProps {
  size?: number;
  color?: string;
  pulseColor?: string;
  animationDuration?: number;
  pulseCount?: number;
  style?: any;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
}

export const PulsatingMarker: React.FC<PulsatingMarkerProps> = ({
  size = 12,
  color = '#007AFF',
  pulseColor = '#58BC6B',
  animationDuration = 2000,
  pulseCount = 3,
  style,
  iconName = 'location',
  iconColor = 'white',
  iconSize,
}) => {
  // Calculate icon size based on marker size if not provided
  const calculatedIconSize = iconSize || Math.max(12, size * 0.5);
  const pulseAnimations = useRef<Animated.Value[]>([]);
  const scaleAnimations = useRef<Animated.Value[]>([]);

  // Initialize animation values
  useEffect(() => {
    pulseAnimations.current = Array.from({ length: pulseCount }, () => new Animated.Value(0));
    scaleAnimations.current = Array.from({ length: pulseCount }, () => new Animated.Value(0));
  }, [pulseCount]);

  useEffect(() => {
    const startAnimations = () => {
      pulseAnimations.current.forEach((pulseAnim, index) => {
        const scaleAnim = scaleAnimations.current[index];
        const delay = (animationDuration / pulseCount) * index;

        // Reset values
        pulseAnim.setValue(0);
        scaleAnim.setValue(0);

        // Create a continuous loop animation
        const createLoopAnimation = () => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.parallel([
                Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: animationDuration,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1,
                  duration: animationDuration,
                  useNativeDriver: true,
                }),
              ]),
              // Reset values for next cycle
              Animated.timing(pulseAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            { iterations: -1 } // Infinite iterations
          );
        };

        const animation = createLoopAnimation();
        animation.start();
      });
    };

    startAnimations();

    // Cleanup function
    return () => {
      pulseAnimations.current.forEach(anim => anim.stopAnimation());
      scaleAnimations.current.forEach(anim => anim.stopAnimation());
    };
  }, [animationDuration, pulseCount]);

  return (
    <View style={[styles.container, style]}>
      {/* Center pinpoint */}
      <View
        style={[
          styles.pinpoint,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
          },
        ]}
      >
        <Ionicons 
          name={iconName as any} 
          size={calculatedIconSize} 
          color={iconColor} 
        />
      </View>

      {/* Pulsating circles */}
      {pulseAnimations.current.map((pulseAnim, index) => {
        const scaleAnim = scaleAnimations.current[index];
        const maxScale = 3 + (index * 0.5); // Each pulse gets slightly larger

        return (
          <Animated.View
            key={index}
            style={[
              styles.pulseCircle,
              {
                width: size * maxScale,
                height: size * maxScale,
                borderRadius: (size * maxScale) / 2,
                borderColor: pulseColor,
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0, 0.8, 0],
                }),
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, maxScale],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pinpoint: {
    position: 'absolute',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 1,
  },
});

export default PulsatingMarker;
