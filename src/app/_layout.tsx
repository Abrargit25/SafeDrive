import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { LiveDriveFloatingButton } from '@/components/drive/LiveDriveFloatingButton';
import { AuthProvider } from '@/features/auth/store/AuthContext';
import { DriveProvider } from '@/features/drive/store/DriveContext';
import { ThemeProvider } from '@/providers/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AuthProvider>
          <DriveProvider>
            <View style={{ flex: 1 }}>
              <Slot />
              <LiveDriveFloatingButton />
            </View>
          </DriveProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
