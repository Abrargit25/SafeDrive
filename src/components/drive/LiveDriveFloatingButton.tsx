import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, useSegments } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTabBarHeight } from '@/constants/layout';
import { useDrive } from '@/features/drive/store/DriveContext';
import { palette } from '@/theme/colors';

function formatTimer(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LiveDriveFloatingButton() {
  const { isDriving, elapsedMs, active } = useDrive();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const segments = useSegments();

  if (!isDriving) {
    return null;
  }

  const onLiveDrive =
    segments.includes('drive') || pathname.endsWith('/drive') || pathname.includes('/drive');

  if (onLiveDrive) {
    return null;
  }

  const onTabScreen = segments[0] === '(tabs)';
  const bottomOffset = onTabScreen
    ? getTabBarHeight(insets.bottom) + 10
    : Math.max(insets.bottom, 12) + 10;

  const eventCount = active?.events.length ?? 0;

  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]} pointerEvents="box-none">
      <Pressable
        style={styles.btn}
        onPress={() => router.push('/(tabs)/drive')}
        accessibilityRole="button"
        accessibilityLabel="Resume live drive"
      >
        <View style={styles.dot} />
        <View style={styles.textCol}>
          <Text style={styles.title}>Resume Drive</Text>
          <Text style={styles.sub}>
            Recording · {formatTimer(elapsedMs)} · {eventCount} events
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.red,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ADE80',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '500',
  },
});
