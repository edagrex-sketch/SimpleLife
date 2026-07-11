import React, { useState, useRef } from 'react';
import { StyleSheet, Text, Pressable, View, Dimensions, StatusBar } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MoodProvider } from './src/context/MoodContext';
import HomeScreen from './src/screens/HomeScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import StatsScreen from './src/screens/StatsScreen';
import NewEntryScreen from './src/screens/NewEntryScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Screen = 'home' | 'timeline' | 'stats';

const TABS = [
  { key: 'home' as Screen, label: 'Hoy', icon: '☀️' },
  { key: 'timeline' as Screen, label: 'Diario', icon: '📖' },
  { key: 'stats' as Screen, label: 'Estadísticas', icon: '📊' },
];

function TabBar({
  active,
  onTabPress,
  onAddPress,
}: {
  active: Screen;
  onTabPress: (screen: Screen) => void;
  onAddPress: () => void;
}) {
  const indicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    const idx = TABS.findIndex(t => t.key === active);
    indicatorPosition.value = withSpring(idx * (SCREEN_WIDTH / TABS.length), {
      damping: 15,
      stiffness: 120,
    });
  }, [active]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabRow}>
        {TABS.map((tab, i) => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={styles.tab}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={onAddPress} style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </View>
  );
}

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const slideAnim = useSharedValue(0);

  React.useEffect(() => {
    slideAnim.value = withTiming(showNewEntry ? 1 : 0, { duration: 300 });
  }, [showNewEntry]);

  const newEntryStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slideAnim.value,
          [0, 1],
          [SCREEN_WIDTH, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const mainStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slideAnim.value,
          [0, 1],
          [0, -SCREEN_WIDTH * 0.15],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(slideAnim.value, [0, 1], [1, 0.7]),
  }));

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={(s) => {
          if (s === 'new-entry') setShowNewEntry(true);
        }} />;
      case 'timeline':
        return <TimelineScreen />;
      case 'stats':
        return <StatsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.mainContent, mainStyle]}>
        {renderScreen()}
        {!showNewEntry && (
          <TabBar
            active={currentScreen}
            onTabPress={setCurrentScreen}
            onAddPress={() => setShowNewEntry(true)}
          />
        )}
      </Animated.View>
      <Animated.View style={[styles.newEntryOverlay, newEntryStyle]}>
        <NewEntryScreen onBack={() => setShowNewEntry(false)} />
      </Animated.View>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <MoodProvider>
          <MainApp />
        </MoodProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  mainContent: { flex: 1 },
  newEntryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    zIndex: 10,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabLabelActive: { color: '#3B82F6' },
  indicator: {
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH / TABS.length,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
});

export default App;
