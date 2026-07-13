import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface GlassBoxProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'light' | 'dark';
}

export default function GlassBox({ children, style, variant = 'light' }: GlassBoxProps) {
  const isDark = variant === 'dark';
  return (
    <View style={[styles.container, isDark && styles.dark, style]}>
      <View style={[styles.glow, isDark && styles.glowDark]} />
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
