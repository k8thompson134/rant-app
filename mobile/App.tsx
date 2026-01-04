/**
 * RantTrack Mobile App
 * Privacy-first symptom tracker for chronically ill people
 */

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './src/database/db';
import { getAllRantEntries } from './src/database/operations';
import { seedSampleData } from './src/database/seed';
import { HomeScreen } from './src/screens/HomeScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { MonthScreen } from './src/screens/MonthScreen';
import { ReviewEntryScreen } from './src/screens/ReviewEntryScreen';
import { QuickAddEntryScreen } from './src/screens/QuickAddEntryScreen';
import { VoiceRecordingScreen } from './src/screens/VoiceRecordingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import CatchUpScreen from './src/screens/CatchUpScreen';
import CatchUpReviewScreen from './src/screens/CatchUpReviewScreen';
import type { HomeStackParamList, MonthStackParamList, RootTabParamList } from './src/types/navigation';
import { darkTheme } from './src/theme/colors';
import { AccessibilityProvider, useTheme } from './src/contexts/AccessibilityContext';

// Use darkTheme directly to avoid bundling issues
const colors = darkTheme;

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MonthStack = createNativeStackNavigator<MonthStackParamList>();

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    // Initialize database on app load
    initDatabase()
      .then(async () => {
        // Only seed sample data in development mode, not in beta/production
        if (__DEV__) {
          const entries = await getAllRantEntries();
          if (entries.length === 0) {
            console.log('[DEV] No entries found, seeding sample data...');
            await seedSampleData();
          }
        }
        setIsDbReady(true);
        console.log('App ready!');
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        Alert.alert('Error', 'Failed to initialize database');
      });
  }, []);

  if (!isDbReady || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AccessibilityProvider>
      <ThemedApp />
    </AccessibilityProvider>
  );
}

/**
 * Themed Home Stack Navigator
 */
function ThemedHomeStack() {
  const colors = useTheme();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen
        name="HomeInput"
        component={HomeScreen}
      />
      <HomeStack.Screen
        name="ReviewEntry"
        component={ReviewEntryScreen}
        options={{
          headerShown: true,
          title: 'Review Entry',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.bgSecondary,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            color: colors.textPrimary,
          },
        }}
      />
      <HomeStack.Screen
        name="VoiceRecording"
        component={VoiceRecordingScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
      <HomeStack.Screen
        name="CatchUp"
        component={CatchUpScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <HomeStack.Screen
        name="CatchUpReview"
        component={CatchUpReviewScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * Themed Month Stack Navigator
 */
function ThemedMonthStack() {
  const colors = useTheme();

  return (
    <MonthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MonthStack.Screen
        name="MonthView"
        component={MonthScreen}
      />
      <MonthStack.Screen
        name="QuickAddEntry"
        component={QuickAddEntryScreen}
        options={{
          headerShown: true,
          title: 'Add Entry',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.bgSecondary,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            color: colors.textPrimary,
          },
          presentation: 'modal',
        }}
      />
      <MonthStack.Screen
        name="VoiceRecording"
        component={VoiceRecordingScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
    </MonthStack.Navigator>
  );
}

/**
 * ThemedApp component that uses theme from AccessibilityContext
 * Wrapped inside AccessibilityProvider to access theme context
 */
function ThemedApp() {
  const colors = useTheme(); // Get current theme from context (dynamic based on user preference)
  const isDark = colors.bgPrimary === darkTheme.bgPrimary; // Detect if using dark theme

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.accentPrimary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: colors.bgElevated,
              backgroundColor: colors.bgPrimary,
            },
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={ThemedHomeStack}
            options={{
              tabBarLabel: 'Rant',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="create-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Month"
            component={ThemedMonthStack}
            options={{
              tabBarLabel: 'Month',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarLabel: 'History',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size}) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
