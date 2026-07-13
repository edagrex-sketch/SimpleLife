import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../utils/colors';

export type TabId = 'home' | 'tasks' | 'calendar' | 'expenses' | 'spaces';

interface Tab {
  id: TabId;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: Tab[] = [
  { id: 'home', icon: 'home', label: 'Inicio' },
  { id: 'calendar', icon: 'calendar', label: 'Calendario' },
  { id: 'spaces', icon: 'trophy', label: 'Rankings' },
  { id: 'expenses', icon: 'wallet', label: 'Gastos' },
];

interface FloatingTabBarProps {
  activeTab: TabId;
  onTabPress: (tabId: TabId) => void;
  onFabPress: () => void;
}

export default function FloatingTabBar({
  activeTab,
  onTabPress,
  onFabPress,
}: FloatingTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {TABS.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => onTabPress(tab.id)}
          />
        ))}
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={onFabPress}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

function TabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [0.85, 1]) }],
    opacity: interpolate(scale.value, [0, 1], [0.5, 1]),
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <Ionicons
          name={tab.icon}
          size={22}
          color={isActive ? COLORS.primary : COLORS.textSecondary}
        />
        {isActive && (
          <Animated.Text style={styles.tabLabel}>
            {tab.label}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    flex: 1,
    maxWidth: 400,
    ...SHADOWS.medium,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: 2,
    ...SHADOWS.fab,
  },
});
