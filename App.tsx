import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { ExpensesProvider } from './src/context/ExpensesContext';
import { CalendarProvider } from './src/context/CalendarContext';
import { SpacesProvider } from './src/context/SpacesContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import SpacesScreen from './src/screens/SpacesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AICoachSheet from './src/components/AICoachSheet';
import NotificationsSheet from './src/components/NotificationsSheet';
import FloatingTabBar, { TabId } from './src/components/FloatingTabBar';
import { COLORS, SHADOWS } from './src/utils/colors';

function AuthFlow() {
  const [showLogin, setShowLogin] = useState(true);
  return showLogin ? (
    <LoginScreen onSwitchToRegister={() => setShowLogin(false)} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setShowLogin(true)} />
  );
}

function AnimatedScreen({ children, tabKey }: { children: React.ReactNode; tabKey: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [tabKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [showAI, setShowAI] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconContainer}>
          <Text style={styles.loadingIcon}>🌅</Text>
        </View>
        <Text style={styles.loadingTitle}>VidaSimple</Text>
        <Text style={styles.loadingSubtitle}>Tu vida, simplificada</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthFlow />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={setCurrentTab}
            onOpenNotifications={() => setShowNotifications(true)}
          />
        );
      case 'tasks':
        return (
          <TasksScreen
            onOpenNotifications={() => setShowNotifications(true)}
          />
        );
      case 'calendar':
        return <CalendarScreen />;
      case 'expenses':
        return (
          <ExpensesScreen
            onOpenNotifications={() => setShowNotifications(true)}
          />
        );
      case 'spaces':
        return (
          <SpacesScreen />
        );
      default:
        return (
          <HomeScreen
            onNavigate={setCurrentTab}
            onOpenNotifications={() => setShowNotifications(true)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AnimatedScreen key={currentTab} tabKey={currentTab}>
        {renderScreen()}
      </AnimatedScreen>
      <FloatingTabBar
        activeTab={currentTab}
        onTabPress={setCurrentTab}
        onFabPress={() => setShowAI(true)}
      />
      <AICoachSheet visible={showAI} onClose={() => setShowAI(false)} />
      <NotificationsSheet
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <TaskProvider>
            <ExpensesProvider>
              <CalendarProvider>
                <SpacesProvider>
                  <ProfileProvider>
                    <NotificationsProvider>
                      <MainApp />
                    </NotificationsProvider>
                  </ProfileProvider>
                </SpacesProvider>
              </CalendarProvider>
            </ExpensesProvider>
          </TaskProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: { fontSize: 40 },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default App;
