import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GlassBoxProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'light' | 'dark';
}

export default function GlassBox({ children, style, variant = 'light' }: GlassBoxProps) {
  const isDark = variant === 'dark';
  const glowOpacity = useSharedValue(0.10);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.18, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, isDark && styles.dark, style]}>
      <Animated.View style={[styles.glow, isDark && styles.glowDark, glowAnimatedStyle]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  dark: {
    backgroundColor: 'rgba(37,43,40,0.85)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  glowDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
