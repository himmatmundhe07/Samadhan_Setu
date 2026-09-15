/**
 * Samadhan Setu — Root Layout
 * Sets up fonts, i18n, providers, error boundary, and navigation.
 */
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { OfflineBanner } from '../src/components/common/OfflineBanner';
import { colors } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { useConnectivity } from '../src/hooks/useConnectivity';
import '../src/utils/i18n'; // Initialize i18n
import '../global.css'; // NativeWind CSS

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const initAuth = useAuthStore((s) => s.initAuth);

  useConnectivity();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Restore JWT token from AsyncStorage before any screen loads
        await initAuth();
      } finally {
        setIsReady(true);
      }
    };
    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.forestGreen} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" />
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.chuna },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.chuna,
  },
});
