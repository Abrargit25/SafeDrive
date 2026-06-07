import type { DriveEvent, DriveEventType, DriveSession } from '@/types/drive';

export type DriveSessionRow = {
  id: number;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
  distance_km: number;
  average_speed: number;
  max_speed: number;
  score: number;
  safety_rating: string | null;
  created_at: string;
};

export type DriveEventRow = {
  id: number;
  session_id: number;
  event_type: string;
  penalty: number;
  severity: number;
  value: number | null;
  unit: string | null;
  timestamp: string;
};

export type AiFeedbackRow = {
  id: number;
  session_id: number;
  feedback: string;
  created_at: string;
};

export type SensorSummaryRow = {
  id: number;
  session_id: number;
  avg_acceleration: number;
  max_acceleration: number;
  avg_rotation: number;
  max_rotation: number;
  phone_movements: number;
};

export type CreateDriveSessionInput = {
  startTime: number;
};

export type UpdateDriveSessionInput = {
  endTime: number;
  durationSeconds: number;
  distanceKm: number;
  averageSpeed: number;
  maxSpeed: number;
  score: number;
  safetyRating: string;
};

export type CreateDriveEventInput = {
  sessionId: number;
  type: DriveEventType;
  penalty: number;
  severity: number;
  value: number;
  unit: string;
  timestamp: number;
};

export type CreateSensorSummaryInput = {
  sessionId: number;
  avgAcceleration: number;
  maxAcceleration: number;
  avgRotation: number;
  maxRotation: number;
  phoneMovements: number;
};

export type SensorStats = {
  avgAcceleration: number;
  maxAcceleration: number;
  avgRotation: number;
  maxRotation: number;
  phoneMovements: number;
};

export type SaveCompletedDriveInput = {
  sessionId: number;
  session: DriveSession;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  safetyRating: string;
  sensorStats: SensorStats;
};
