import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { ExpensesProvider } from './src/context/ExpensesContext';
import { CalendarProvider } from './src/context/CalendarContext';
import { SpacesProvider } from './src/context/SpacesContext';
import { ProfileProvider } from './src/context/ProfileContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import SpacesScreen from './src/screens/SpacesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AICoachSheet from './src/components/AICoachSheet';
import { COLORS } from './src/utils/colors';

type Tab = 'home' | 'tasks' | 'calendar' | 'expenses' | 'spaces';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Inicio', icon: '🏠' },
  { key: 'tasks', label: 'Tareas', icon: '📋' },
  { key: 'calendar', label: 'Calendario', icon: '📅' },
  { key: 'expenses', label: 'Gastos', icon: '💰' },
  { key: 'spaces', label: 'Espacios', icon: '👥' },
];

function TabBar({ active, onTabPress }: { active: Tab; onTabPress: (tab: Tab) => void }) {
  return (
    <View style={styles.tabBar}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => onTabPress(tab.key)} style={styles.tab}>
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AuthFlow() {
  const [showLogin, setShowLogin] = useState(true);
  return showLogin ? (
    <LoginScreen onSwitchToRegister={() => setShowLogin(false)} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setShowLogin(true)} />
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [showAI, setShowAI] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🌅</Text>
        <Text style={styles.loadingTitle}>SimpleLife</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthFlow />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'home': return <HomeScreen />;
      case 'tasks': return <TasksScreen />;
      case 'calendar': return <CalendarScreen />;
      case 'expenses': return <ExpensesScreen />;
      case 'spaces': return <SpacesScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {renderScreen()}
      <TabBar active={currentTab} onTabPress={setCurrentTab} />
      <Pressable style={styles.aiFab} onPress={() => setShowAI(true)}>
        <Text style={styles.aiFabText}>🤖</Text>
      </Pressable>
      <AICoachSheet visible={showAI} onClose={() => setShowAI(false)} />
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
                    <MainApp />
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
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 64, marginBottom: 8 },
  loadingTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'Outfit' },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  tabRow: { flexDirection: 'row', paddingTop: 8, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  tabIcon: { fontSize: 20, marginBottom: 2, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.primary },
  tabIndicator: { width: 20, height: 3, backgroundColor: COLORS.primary, borderRadius: 2, marginTop: 4 },
  aiFab: {
    position: 'absolute', bottom: 100, right: 16, width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    borderWidth: 1, borderColor: COLORS.divider,
  },
  aiFabText: { fontSize: 22 },
});

export default App;
