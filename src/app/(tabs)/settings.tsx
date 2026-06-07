import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, ScreenContainer, SectionTitle } from '@/components';
import { thresholds } from '@/constants/thresholds';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';
import { palette } from '@/theme/colors';

export default function SettingsScreen() {
  useFocusedStatusBar({ style: 'dark', translucent: false });

  const detectionHz = 1000 / thresholds.sensorIntervalMs;
  const uiHz = 1000 / thresholds.sensorUiRefreshMs;

  return (
    <ScreenContainer scroll>
      <AppHeader title="Settings" />

      <SectionTitle title="Battery & performance" />
      <Card>
        <Text style={styles.body}>
          SafeDrive is designed to limit background work and only use sensors during an active
          drive.
        </Text>
        <View style={styles.list}>
          <Text style={styles.item}>
            • Sensors start on <Text style={styles.em}>Start Drive</Text> and stop on{' '}
            <Text style={styles.em}>End Drive</Text>
          </Text>
          <Text style={styles.item}>
            • Event detection: {detectionHz} Hz ({thresholds.sensorIntervalMs} ms)
          </Text>
          <Text style={styles.item}>
            • Live dashboard refresh: {uiHz} Hz ({thresholds.sensorUiRefreshMs} ms)
          </Text>
          <Text style={styles.item}>• GPS updates: every 1 second, 5 m minimum movement</Text>
          <Text style={styles.item}>• Magnetometer skipped if unavailable on device</Text>
          <Text style={styles.item}>
            • Subscriptions are removed when the drive ends or the app unmounts
          </Text>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.textSecondary,
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  item: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.text,
  },
  em: {
    fontWeight: '600',
    color: palette.primaryDark,
  },
});
