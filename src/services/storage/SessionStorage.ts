import {
  getDatabase,
  loadDriveSessions,
  migrateLegacySessionsIfNeeded,
  saveCompletedDrive,
  startDriveSession,
} from '@/db/databasehelper';
import type { DriveSession } from '@/types/drive';
import type { SensorStats } from '@/db/databasehelper';

export async function initSessionStorage() {
  await getDatabase();
  await migrateLegacySessionsIfNeeded();
}

export async function loadSessions(): Promise<DriveSession[]> {
  return loadDriveSessions();
}

export async function saveSession(
  session: DriveSession,
  meta: {
    maxSpeedKmh: number;
    avgSpeedKmh: number;
    safetyRating: string;
    sensorStats: SensorStats;
  },
) {
  const sessionId = session.dbSessionId;
  if (!sessionId) {
    throw new Error('Cannot save drive session without dbSessionId');
  }

  await saveCompletedDrive({
    sessionId,
    session,
    maxSpeedKmh: meta.maxSpeedKmh,
    avgSpeedKmh: meta.avgSpeedKmh,
    safetyRating: meta.safetyRating,
    sensorStats: meta.sensorStats,
  });
}

export async function createActiveSession(startTime: number): Promise<number> {
  return startDriveSession(startTime);
}

export async function getLatestSession(): Promise<DriveSession | null> {
  const sessions = await loadSessions();
  return sessions[0] ?? null;
}
