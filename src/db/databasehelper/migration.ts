import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DriveSession } from '@/types/drive';

import { createDriveEvents } from './DriveEventHelper';
import { createDriveSession, getAllDriveSessions, updateDriveSession } from './DriveSessionHelper';
import { createSensorSummary } from './SensorSummaryHelper';
import { withTransaction } from './connection';

const LEGACY_KEY = '@safedrive/sessions';
const MIGRATED_KEY = '@safedrive/migrated-to-sqlite';

export async function migrateLegacySessionsIfNeeded(): Promise<void> {
  const migrated = await AsyncStorage.getItem(MIGRATED_KEY);
  if (migrated === '1') return;

  const existing = await getAllDriveSessions();
  if (existing.length > 0) {
    await AsyncStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  const raw = await AsyncStorage.getItem(LEGACY_KEY);
  if (!raw) {
    await AsyncStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  const sessions = JSON.parse(raw) as DriveSession[];
  for (const session of sessions) {
    await importLegacySession(session);
  }

  await AsyncStorage.setItem(MIGRATED_KEY, '1');
}

async function importLegacySession(session: DriveSession): Promise<void> {
  const endedAt = session.endedAt ?? session.startedAt;
  const durationSeconds = Math.max(0, Math.round((endedAt - session.startedAt) / 1000));
  const phoneMovements = session.events.filter((event) => event.type === 'phone_handling').length;

  await withTransaction(async () => {
    const sessionId = await createDriveSession({ startTime: session.startedAt });
    await updateDriveSession(sessionId, {
      endTime: endedAt,
      durationSeconds,
      distanceKm: session.distanceMeters / 1000,
      averageSpeed: 0,
      maxSpeed: 0,
      score: session.score,
      safetyRating: session.score >= 80 ? 'Good' : session.score >= 60 ? 'Fair' : 'Poor',
    });

    if (session.events.length) {
      await createDriveEvents(
        session.events.map((event) => ({
          sessionId,
          type: event.type,
          penalty: event.penalty ?? 1,
          severity: event.severity,
          value: event.value,
          unit: event.unit,
          timestamp: event.timestamp,
        })),
      );
    }

    await createSensorSummary({
      sessionId,
      avgAcceleration: 0,
      maxAcceleration: 0,
      avgRotation: 0,
      maxRotation: 0,
      phoneMovements,
    });
  });
}
