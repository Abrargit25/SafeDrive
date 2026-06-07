import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppHeader, EmptyState, FilterChips, HistoryRow, ScreenContainer } from '@/components';
import { useDrive } from '@/features/drive/store/DriveContext';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';
import { palette } from '@/theme/colors';
import { formatDuration } from '@/utils/date';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'good', label: 'Good' },
  { key: 'fair', label: 'Fair' },
  { key: 'poor', label: 'Poor' },
];

function matchesFilter(score: number, filter: string) {
  if (filter === 'all') return true;
  if (filter === 'good') return score >= 80;
  if (filter === 'fair') return score >= 60 && score < 80;
  return score < 60;
}

export default function HistoryScreen() {
  const { history, refreshHistory, openHistorySession } = useDrive();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useFocusedStatusBar({ style: 'dark', translucent: false });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      refreshHistory()
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [refreshHistory]),
  );

  const filtered = history.filter((trip) => matchesFilter(trip.score, filter));
  const hasDrives = history.length > 0;
  const noFilterMatch = hasDrives && filtered.length === 0;

  return (
    <ScreenContainer scroll>
      <AppHeader title="History" rightIcon="calendar-outline" onRightPress={() => {}} />

      <View style={styles.filters}>
        <FilterChips options={filters} active={filter} onChange={setFilter} />
      </View>

      <View style={styles.list}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.primary} />
          </View>
        ) : !hasDrives ? (
          <EmptyState title="No drives yet" message="Complete a drive to see your history here." />
        ) : noFilterMatch ? (
          <EmptyState
            title="No matching drives"
            message="Try a different filter to see more trips."
          />
        ) : (
          filtered.map((trip) => {
            const durationMs = (trip.endedAt ?? trip.startedAt) - trip.startedAt;
            const started = new Date(trip.startedAt);

            return (
              <HistoryRow
                key={trip.id}
                score={trip.score}
                date={started.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                time={started.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                distance={`${(trip.distanceMeters / 1000).toFixed(1)} km`}
                duration={formatDuration(durationMs)}
                events={trip.events.length}
                hasAiSummary={!!trip.aiSummary}
                onPress={() => openHistorySession(trip.id)}
                onAiPress={() =>
                  router.push({ pathname: '/ai-insight', params: { sessionId: trip.id } })
                }
              />
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginTop: 4,
    marginBottom: 4,
  },
  list: {
    marginTop: 12,
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
