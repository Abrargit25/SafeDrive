import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LiveDriveDashboard } from '@/components/drive/LiveDriveDashboard';
import { useDrive } from '@/features/drive/store/DriveContext';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';

export default function LiveDriveScreen() {
  const { isDriving, completed } = useDrive();

  useFocusedStatusBar({ style: 'light', translucent: true });

  if (isDriving) {
    return <LiveDriveDashboard />;
  }

  // End Drive navigates to summary — avoid flashing fallback while transitioning.
  if (completed) {
    return null;
  }

  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>No active drive session</Text>
      <Pressable style={styles.fallbackBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.fallbackBtnText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E4FA8',
    gap: 16,
    padding: 24,
  },
  fallbackText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '500',
  },
  fallbackBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fallbackBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
