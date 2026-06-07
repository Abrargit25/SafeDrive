import { getDatabase } from './connection';
import type {
  CreateDriveSessionInput,
  DriveSessionRow,
  UpdateDriveSessionInput,
} from './types';

function toIso(ms: number) {
  return new Date(ms).toISOString();
}

export async function createDriveSession(input: CreateDriveSessionInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO drive_session (start_time, score, created_at)
     VALUES (?, 100, datetime('now'))`,
    toIso(input.startTime),
  );
  return result.lastInsertRowId;
}

export async function updateDriveSession(
  sessionId: number,
  input: UpdateDriveSessionInput,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE drive_session
     SET end_time = ?,
         duration_seconds = ?,
         distance_km = ?,
         average_speed = ?,
         max_speed = ?,
         score = ?,
         safety_rating = ?
     WHERE id = ?`,
    toIso(input.endTime),
    input.durationSeconds,
    input.distanceKm,
    input.averageSpeed,
    input.maxSpeed,
    input.score,
    input.safetyRating,
    sessionId,
  );
}

export async function getDriveSessionById(sessionId: number): Promise<DriveSessionRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<DriveSessionRow>(
    'SELECT * FROM drive_session WHERE id = ?',
    sessionId,
  );
}

export async function getAllDriveSessions(): Promise<DriveSessionRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<DriveSessionRow>(
    'SELECT * FROM drive_session WHERE end_time IS NOT NULL ORDER BY start_time DESC',
  );
}

export async function deleteDriveSession(sessionId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM drive_session WHERE id = ?', sessionId);
}
