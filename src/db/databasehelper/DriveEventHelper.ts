import { getDatabase } from './connection';
import type { CreateDriveEventInput, DriveEventRow } from './types';

function toIso(ms: number) {
  return new Date(ms).toISOString();
}

export async function createDriveEvent(input: CreateDriveEventInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO drive_event
      (session_id, event_type, penalty, severity, value, unit, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.sessionId,
    input.type,
    input.penalty,
    input.severity,
    input.value,
    input.unit,
    toIso(input.timestamp),
  );
  return result.lastInsertRowId;
}

export async function createDriveEvents(inputs: CreateDriveEventInput[]): Promise<void> {
  if (!inputs.length) return;
  const db = await getDatabase();
  for (const input of inputs) {
    await db.runAsync(
      `INSERT INTO drive_event
        (session_id, event_type, penalty, severity, value, unit, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      input.sessionId,
      input.type,
      input.penalty,
      input.severity,
      input.value,
      input.unit,
      toIso(input.timestamp),
    );
  }
}

export async function getDriveEventsBySessionId(sessionId: number): Promise<DriveEventRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<DriveEventRow>(
    'SELECT * FROM drive_event WHERE session_id = ? ORDER BY timestamp ASC',
    sessionId,
  );
}

export async function deleteDriveEventsBySessionId(sessionId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM drive_event WHERE session_id = ?', sessionId);
}
