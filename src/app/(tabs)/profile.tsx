import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  Card,
  MenuRow,
  ScreenContainer,
  SectionTitle,
  StatBlock,
  StatGrid,
} from '@/components';
import { AchievementBadge } from '@/components/profile/AchievementBadge';
import { UserCard } from '@/components/profile/UserCard';
import { useAuth } from '@/features/auth/store/AuthContext';
import { useDrive } from '@/features/drive/store/DriveContext';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';
import { palette } from '@/theme/colors';
import { formatDuration } from '@/utils/date';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { history, refreshHistory } = useDrive();

  useFocusedStatusBar({ style: 'dark', translucent: false });

  useFocusEffect(
    useCallback(() => {
      refreshHistory().catch(() => {});
    }, [refreshHistory]),
  );

  const stats = useMemo(() => {
    if (!history.length) {
      return {
        trips: 0,
        avgScore: 0,
        totalDistKm: 0,
        totalMs: 0,
        totalEvents: 0,
        bestScore: 0,
      };
    }

    const totalEvents = history.reduce((sum, trip) => sum + trip.events.length, 0);
    const avgScore = Math.round(history.reduce((sum, trip) => sum + trip.score, 0) / history.length);
    const totalDistKm = history.reduce((sum, trip) => sum + trip.distanceMeters, 0) / 1000;
    const totalMs = history.reduce(
      (sum, trip) => sum + ((trip.endedAt ?? trip.startedAt) - trip.startedAt),
      0,
    );
    const bestScore = Math.max(...history.map((trip) => trip.score));

    return {
      trips: history.length,
      avgScore,
      totalDistKm,
      totalMs,
      totalEvents,
      bestScore,
    };
  }, [history]);

  const achievements = useMemo(() => {
    const items: Array<{
      label: string;
      icon: 'shield-checkmark' | 'car' | 'star' | 'trophy-outline';
      color: string;
    }> = [];

    if (stats.trips >= 1) {
      items.push({ label: 'First Trip', icon: 'car', color: palette.blue });
    }
    if (stats.avgScore >= 80) {
      items.push({ label: 'Safe Driver', icon: 'shield-checkmark', color: palette.primary });
    }
    if (stats.bestScore === 100) {
      items.push({ label: 'Perfect Drive', icon: 'star', color: palette.yellow });
    }
    if (stats.trips >= 5) {
      items.push({ label: `${stats.trips} Trips`, icon: 'trophy-outline', color: palette.purple });
    }

    return items;
  }, [stats]);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Profile" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <UserCard
          name={user?.name ?? 'Driver'}
          phone={user?.phone}
          avgScore={stats.avgScore}
        />

        <SectionTitle title="Driving Stats" />
        <Card style={styles.statsCard}>
          <StatGrid columns={3}>
            <StatBlock
              label="Trips"
              value={`${stats.trips}`}
              align="center"
              icon="car-outline"
              iconColor={palette.purple}
            />
            <StatBlock
              label="Avg Score"
              value={stats.trips ? `${stats.avgScore}` : '—'}
              align="center"
              icon="ribbon-outline"
              iconColor={palette.primary}
            />
            <StatBlock
              label="Distance"
              value={stats.trips ? `${stats.totalDistKm.toFixed(1)} km` : '—'}
              align="center"
              icon="navigate-outline"
              iconColor={palette.blue}
            />
          </StatGrid>
          <StatGrid columns={3}>
            <StatBlock
              label="Drive Time"
              value={stats.trips ? formatDuration(stats.totalMs) : '—'}
              align="center"
              icon="time-outline"
              iconColor={palette.orange}
            />
            <StatBlock
              label="Events"
              value={stats.trips ? `${stats.totalEvents}` : '—'}
              align="center"
              icon="warning-outline"
              iconColor={palette.red}
            />
            <StatBlock
              label="Best Score"
              value={stats.trips ? `${stats.bestScore}` : '—'}
              align="center"
              icon="star-outline"
              iconColor={palette.yellow}
            />
          </StatGrid>
        </Card>

        <SectionTitle title="Achievements" />
        {achievements.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badges}>
            {achievements.map((item) => (
              <AchievementBadge
                key={item.label}
                label={item.label}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </ScrollView>
        ) : null}

        <Card style={styles.menu}>
          <MenuRow label="Privacy" icon="lock-closed-outline" iconColor={palette.purple} />
          <MenuRow label="Help & Support" icon="help-circle-outline" iconColor={palette.orange} />
          <MenuRow
            label="Sign Out"
            icon="log-out-outline"
            iconColor={palette.red}
            showChevron={false}
            onPress={handleSignOut}
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    marginBottom: 20,
    gap: 16,
    paddingVertical: 4,
  },
  badges: {
    marginBottom: 20,
  },
  menu: {
    marginBottom: 24,
  },
});
