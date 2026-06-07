import type { DriveEvent, DriveEventType, DriveSession } from '@/types/drive';

import { createDriveEvents, getDriveEventsBySessionId } from './DriveEventHelper';
import {
  createDriveSession,
  getAllDriveSessions,
  getDriveSessionById,
  updateDriveSession,
} from './DriveSessionHelper';
import { getAiFeedbackBySessionId, getAiFeedbackMap } from './AiFeedbackHelper';
import { createSensorSummary, getSensorSummaryBySessionId } from './SensorSummaryHelper';
import { withTransaction } from './connection';
import type { SaveCompletedDriveInput, SensorStats } from './types';

function parseIso(iso: string) {
  return new Date(iso).getTime();
}

function rowToDriveEvent(row: {
  id: number;
  event_type: string;
  penalty: number;
  severity: number;
  value: number | null;
  unit: string | null;
  timestamp: string;
}): DriveEvent {
  return {
    id: String(row.id),
    type: row.event_type as DriveEventType,
    timestamp: parseIso(row.timestamp),
    value: row.value ?? 0,
    unit: row.unit ?? '',
    severity: row.severity,
    penalty: row.penalty,
  };
}

function rowToDriveSession(
  row: Awaited<ReturnType<typeof getDriveSessionById>>,
  events: DriveEvent[],
  aiSummary?: string | null,
): DriveSession | null {
  if (!row) return null;
  return {
    id: String(row.id),
    startedAt: parseIso(row.start_time),
    endedAt: row.end_time ? parseIso(row.end_time) : undefined,
    score: row.score,
    distanceMeters: row.distance_km * 1000,
    events,
    aiSummary: aiSummary ?? null,
  };
}

export async function startDriveSession(startTime: number): Promise<number> {
  return createDriveSession({ startTime });
}

export async function saveCompletedDrive(input: SaveCompletedDriveInput): Promise<void> {
  const { sessionId, session, maxSpeedKmh, avgSpeedKmh, safetyRating, sensorStats } = input;
  const endedAt = session.endedAt ?? Date.now();
  const durationSeconds = Math.max(0, Math.round((endedAt - session.startedAt) / 1000));

  await withTransaction(async () => {
    await updateDriveSession(sessionId, {
      endTime: endedAt,
      durationSeconds,
      distanceKm: session.distanceMeters / 1000,
      averageSpeed: avgSpeedKmh,
      maxSpeed: maxSpeedKmh,
      score: session.score,
      safetyRating,
    });

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

    await createSensorSummary({
      sessionId,
      ...sensorStats,
    });
  });
}

export async function loadDriveSessions(): Promise<DriveSession[]> {
  const rows = await getAllDriveSessions();
  const aiMap = await getAiFeedbackMap();
  const sessions: DriveSession[] = [];

  for (const row of rows) {
    const eventRows = await getDriveEventsBySessionId(row.id);
    sessions.push({
      id: String(row.id),
      startedAt: parseIso(row.start_time),
      endedAt: row.end_time ? parseIso(row.end_time) : undefined,
      score: row.score,
      distanceMeters: row.distance_km * 1000,
      events: eventRows.map(rowToDriveEvent),
      aiSummary: aiMap[row.id] ?? null,
    });
  }

  return sessions;
}

export async function getDriveSessionDetails(sessionId: number) {
  const row = await getDriveSessionById(sessionId);
  if (!row) return null;

  const events = (await getDriveEventsBySessionId(sessionId)).map(rowToDriveEvent);
  const sensorSummary = await getSensorSummaryBySessionId(sessionId);
  const aiFeedback = await getAiFeedbackBySessionId(sessionId);

  return {
    session: rowToDriveSession(row, events, aiFeedback?.feedback ?? null),
    aiSummary: aiFeedback?.feedback ?? null,
    sensorSummary,
    meta: {
      averageSpeed: row.average_speed,
      maxSpeed: row.max_speed,
      safetyRating: row.safety_rating,
      durationSeconds: row.duration_seconds,
    },
  };
}

export function buildSensorStats(input: {
  accelSum: number;
  accelCount: number;
  maxAccel: number;
  rotationSum: number;
  rotationCount: number;
  maxRotation: number;
  phoneMovements: number;
}): SensorStats {
  return {
    avgAcceleration: input.accelCount ? input.accelSum / input.accelCount : 0,
    maxAcceleration: input.maxAccel,
    avgRotation: input.rotationCount ? input.rotationSum / input.rotationCount : 0,
    maxRotation: input.maxRotation,
    phoneMovements: input.phoneMovements,
  };
}
