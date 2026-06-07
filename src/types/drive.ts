export type DriveEventType =
  | 'harsh_brake'
  | 'harsh_acceleration'
  | 'sharp_turn'
  | 'aggressive_steering'
  | 'excessive_movement'
  | 'phone_handling';

/** Only these six driving events are tracked in the app. */
export const DRIVE_EVENT_TYPES: DriveEventType[] = [
  'harsh_brake',
  'harsh_acceleration',
  'sharp_turn',
  'aggressive_steering',
  'excessive_movement',
  'phone_handling',
];

export type DetectedEvent = {
  type: DriveEventType;
  /** Raw sensor reading that triggered the event. */
  value: number;
  unit: string;
  /** How far the reading exceeded the detection threshold. */
  severity: number;
  speedKmh?: number;
};

export type DriveEvent = {
  id: string;
  type: DriveEventType;
  timestamp: number;
  value: number;
  unit: string;
  severity: number;
  speedKmh?: number;
  latitude?: number;
  longitude?: number;
  /** Filled when the drive ends — derived from real sensor data. */
  penalty?: number;
};

export type DriveSession = {
  id: string;
  /** SQLite primary key while a drive is active or after persistence. */
  dbSessionId?: number;
  startedAt: number;
  endedAt?: number;
  /** Starts at 100 live; final score computed on End Drive from event data. */
  score: number;
  distanceMeters: number;
  events: DriveEvent[];
  /** Saved AI coach insight for this session, if generated. */
  aiSummary?: string | null;
};

export type SensorSnapshot = {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  motionX: number;
  motionY: number;
  motionZ: number;
  pitch?: number;
  roll?: number;
  yaw?: number;
  speedKmh?: number;
  magX?: number;
  magY?: number;
  magZ?: number;
};

export type AccelerationReading = {
  x: number;
  y: number;
  z: number;
  magnitude: number;
};

export type EventTypeStats = {
  count: number;
  peak: number;
  unit: string;
  latest: number;
};
