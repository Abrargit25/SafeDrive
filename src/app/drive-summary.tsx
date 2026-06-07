import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  EventChart,
  ScoreRing,
  ScoreRow,
  ScreenContainer,
  SectionTitle,
  StatBlock,
  StatGrid,
} from '@/components';
import { useDrive } from '@/features/drive/store/DriveContext';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';
import { POINTS_PER_EVENT } from '@/services/scoring/ScoreEngine';
import { palette, scoreLabel } from '@/theme/colors';
import { formatDuration } from '@/utils/date';
import type { DriveEventType } from '@/types/drive';
import { formatPeakValue, summarizeEventsByType } from '@/utils/eventStats';
import { eventLabel } from '@/utils/eventLabels';

export default function DriveSummaryScreen() {
  const { completed, rating } = useDrive();

  useFocusedStatusBar({ style: 'dark', translucent: false });

  if (!completed) {
    return (
      <ScreenContainer>
        <Text>No session data</Text>
        <Button label="Go Home" onPress={() => router.replace('/(tabs)')} />
      </ScreenContainer>
    );
  }

  const duration = (completed.endedAt ?? Date.now()) - completed.startedAt;
  const byType = summarizeEventsByType(completed.events);
  const totalEvents = completed.events.length;

  const chartSegments = byType.map((row, i) => ({
    label: eventLabel(row.type),
    value: row.count,
    color: [palette.red, palette.orange, palette.yellow, palette.blue, palette.purple, palette.primary][i % 6],
  }));

  return (
    <ScreenContainer scroll>
      <SectionTitle title="Drive Summary" />
      <Card style={styles.scoreCard}>
        <View style={styles.center}>
          <ScoreRing
            score={completed.score}
            size={150}
            subtitle={scoreLabel(completed.score)}
          />
          <Text style={styles.rating}>{rating}</Text>
          <Text style={styles.calcNote}>Score = 100 − {totalEvents} events</Text>
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <StatGrid columns={3}>
          <StatBlock
            label="Duration"
            value={formatDuration(duration)}
            icon="time-outline"
            iconColor={palette.blue}
            align="center"
          />
          <StatBlock
            label="Events"
            value={`${totalEvents}`}
            icon="warning-outline"
            iconColor={palette.orange}
            align="center"
          />
          <StatBlock
            label="Distance"
            value={`${(completed.distanceMeters / 1000).toFixed(1)} km`}
            icon="navigate-outline"
            iconColor={palette.primary}
            align="center"
          />
        </StatGrid>
      </Card>

      {chartSegments.length > 0 ? (
        <View style={styles.block}>
          <EventChart total={totalEvents} segments={chartSegments} />
        </View>
      ) : null}

      <Card style={styles.block}>
        <ScoreRow label="Start Score" value={100} positive />
        {byType.map((row) => (
          <ScoreRow
            key={row.type}
            label={`${eventLabel(row.type as DriveEventType)} ×${row.count} (${formatPeakValue(row.type, row.peak, row.unit)})`}
            value={-row.count * POINTS_PER_EVENT}
          />
        ))}
        <ScoreRow label="Total Events" value={-totalEvents} />
        <ScoreRow label="Final Score" value={completed.score} positive />
      </Card>

      <Button
        label="Explain"
        variant="purple"
        icon="sparkles-outline"
        onPress={() =>
          router.push({ pathname: '/ai-insight', params: { sessionId: completed.id } })
        }
      />
      <Button label="Back to Dashboard" onPress={() => router.replace('/(tabs)')} variant="secondary" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    marginBottom: 16,
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.primaryDark,
  },
  calcNote: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  block: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
    paddingVertical: 4,
  },
});
