import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import {
  AppHeader,
  Card,
  EmptyState,
  EventChart,
  ScoreRing,
  ScreenContainer,
  SectionTitle,
  StatBlock,
  StatGrid,
} from '@/components';

  
import { useDrive } from '@/features/drive/store/DriveContext';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';
import { palette, scoreLabel } from '@/theme/colors';
import type { DriveEventType } from '@/types/drive';
import { eventLabel } from '@/utils/eventLabels';
import { formatDuration } from '@/utils/date';

export default function AnalyticsScreen() {
  const { history } = useDrive();

  useFocusedStatusBar({ style: 'dark', translucent: false });

  const stats = useMemo(() => {
    if (!history.length) return null;
    const totalEvents = history.reduce((n, s) => n + s.events.length, 0);
    const avgScore = Math.round(history.reduce((n, s) => n + s.score, 0) / history.length);
    const totalDist = history.reduce((n, s) => n + s.distanceMeters, 0);
    const totalMs = history.reduce(
      (n, s) => n + ((s.endedAt ?? s.startedAt) - s.startedAt),
      0,
    );
    const eventMap: Record<string, number> = {};
    history.forEach((s) =>
      s.events.forEach((e) => {
        eventMap[e.type] = (eventMap[e.type] ?? 0) + 1;
      }),
    );
    return { totalEvents, avgScore, totalDist, totalMs, eventMap };
  }, [history]);

  const chartSegments = stats
    ? Object.entries(stats.eventMap).map(([type, value], i) => ({
        label: eventLabel(type as DriveEventType),
        value,
        color: [palette.red, palette.orange, palette.yellow, palette.blue, palette.purple][i % 5],
      }))
    : [];

  return (
    <ScreenContainer scroll>
      <AppHeader title="Analytics" />

      {!stats ? (
        <EmptyState title="No analytics yet" message="Finish a few drives to see trends." />
      ) : (
        <>
          <Card style={styles.block}>
            <SectionTitle title="Average Score" />
            <View style={styles.center}>
              <ScoreRing score={stats.avgScore} size={140} subtitle={scoreLabel(stats.avgScore)} />
            </View>
          </Card>

          <View style={styles.block}>
            <EventChart total={stats.totalEvents} segments={chartSegments} />
          </View>

          <Card>
            <StatGrid columns={3}>
              <StatBlock label="Trips" value={`${history.length}`} />
              <StatBlock label="Distance" value={`${(stats.totalDist / 1000).toFixed(0)} km`} />
              <StatBlock label="Drive Time" value={formatDuration(stats.totalMs)} />
            </StatGrid>
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
