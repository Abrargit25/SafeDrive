import { getDatabase } from './connection';
import type { CreateSensorSummaryInput, SensorSummaryRow } from './types';

export async function createSensorSummary(input: CreateSensorSummaryInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO sensor_summary
      (session_id, avg_acceleration, max_acceleration, avg_rotation, max_rotation, phone_movements)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.sessionId,
    input.avgAcceleration,
    input.maxAcceleration,
    input.avgRotation,
    input.maxRotation,
    input.phoneMovements,
  );
  return result.lastInsertRowId;
}

export async function getSensorSummaryBySessionId(
  sessionId: number,
): Promise<SensorSummaryRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SensorSummaryRow>(
    'SELECT * FROM sensor_summary WHERE session_id = ?',
    sessionId,
  );
}

export async function updateSensorSummary(
  sessionId: number,
  input: Omit<CreateSensorSummaryInput, 'sessionId'>,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE sensor_summary
     SET avg_acceleration = ?,
         max_acceleration = ?,
         avg_rotation = ?,
         max_rotation = ?,
         phone_movements = ?
     WHERE session_id = ?`,
    input.avgAcceleration,
    input.maxAcceleration,
    input.avgRotation,
    input.maxRotation,
    input.phoneMovements,
    sessionId,
  );
}

export async function deleteSensorSummaryBySessionId(sessionId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sensor_summary WHERE session_id = ?', sessionId);
}
