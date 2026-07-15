import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View, StatusBar, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
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

function SplashLoadingScreen() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const logoAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const textAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingLogoContainer, logoAnim]}>
        <Image
          source={require('./ios/SimpleLife/Images.xcassets/AppIcon.appiconset/icon-1024.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={textAnim}>
        <Text style={styles.loadingTitle}>VidaSimple</Text>
        <Text style={styles.loadingSubtitle}>Tu vida, simplificada</Text>
      </Animated.View>
    </View>
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
    return <SplashLoadingScreen />;
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
    gap: 16,
  },
  loadingLogoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 120,
    height: 120,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default App;
