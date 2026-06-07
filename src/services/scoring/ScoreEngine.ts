import { thresholds } from '@/constants/thresholds';
import type { DetectedEvent, DriveEvent, DriveEventType } from '@/types/drive';

export const POINTS_PER_EVENT = 1;

export function computeSeverity(type: DriveEventType, value: number): number {
  switch (type) {
    case 'harsh_brake':
      return Math.max(0, thresholds.harshBrake - value);
    case 'harsh_acceleration':
      return Math.max(0, value - thresholds.harshAcceleration);
    case 'sharp_turn':
      return Math.max(0, Math.abs(value) - thresholds.sharpTurn);
    case 'aggressive_steering':
      return Math.max(0, value - thresholds.aggressiveSteeringTurns + 1);
    case 'excessive_movement':
      return Math.max(0, value - thresholds.excessiveMovementAxis);
    case 'phone_handling':
      return Math.max(0, value - thresholds.phoneOrientationChangeDeg);
    default:
      return 0;
  }
}

export function getEventUnit(type: DriveEventType): string {
  switch (type) {
    case 'harsh_brake':
    case 'harsh_acceleration':
    case 'excessive_movement':
      return 'g';
    case 'sharp_turn':
      return 'rad/s';
    case 'aggressive_steering':
      return 'turns';
    case 'phone_handling':
      return '°';
    default:
      return '';
  }
}

export function buildDetectedEvent(
  type: DriveEventType,
  value: number,
  speedKmh?: number,
): DetectedEvent {
  return {
    type,
    value,
    unit: getEventUnit(type),
    severity: computeSeverity(type, value),
    speedKmh,
  };
}

export class ScoreEngine {
  /** Each detected event costs 1 point. */
  computeEventPenalty(_event?: DriveEvent | DetectedEvent): number {
    return POINTS_PER_EVENT;
  }

  /** Score = 100 − TotalEvents */
  calculate(events: DriveEvent[], baseScore = 100) {
    return Math.max(0, baseScore - events.length);
  }

  finalizeEvents(events: DriveEvent[]): DriveEvent[] {
    return events.map((event) => ({
      ...event,
      penalty: POINTS_PER_EVENT,
    }));
  }
}
