import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import GlassBox from './GlassBox';
import { Space } from '../types';
import { COLORS } from '../utils/colors';
import { useScalePress } from '../hooks/useScalePress';

interface SpaceCardProps {
  space: Space;
  onPress: () => void;
}

export default function SpaceCard({ space, onPress }: SpaceCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animatedStyle}>
        <GlassBox style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{space.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>{space.name}</Text>
              {space.invite_code && (
                <Text style={styles.code}>Código: {space.invite_code}</Text>
              )}
            </View>
          </View>
        </GlassBox>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  code: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
