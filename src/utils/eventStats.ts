import { DRIVE_EVENT_TYPES, type DriveEvent, type DriveEventType, type EventTypeStats } from '@/types/drive';
import { getEventUnit } from '@/services/scoring/ScoreEngine';

export type EventTypeSummary = {
  type: DriveEventType;
  count: number;
  peak: number;
  unit: string;
  totalPenalty: number;
};

export function buildEventCountMap(events: DriveEvent[] = []) {
  const counts = Object.fromEntries(
    DRIVE_EVENT_TYPES.map((type) => [type, 0]),
  ) as Record<DriveEventType, number>;

  for (const event of events) {
    if (event.type in counts) {
      counts[event.type] += 1;
    }
  }

  return counts;
}

export function buildEventStatsMap(events: DriveEvent[] = []) {
  const stats = Object.fromEntries(
    DRIVE_EVENT_TYPES.map((type) => [
      type,
      { count: 0, peak: 0, unit: getEventUnit(type), latest: 0 } satisfies EventTypeStats,
    ]),
  ) as Record<DriveEventType, EventTypeStats>;

  for (const event of events) {
    const row = stats[event.type];
    row.count += 1;
    row.latest = event.value;
    row.peak =
      event.type === 'harsh_brake'
        ? Math.min(row.peak, event.value)
        : Math.max(row.peak, Math.abs(event.value));
    row.unit = event.unit;
  }

  return stats;
}

export function summarizeEventsByType(events: DriveEvent[] = []): EventTypeSummary[] {
  const stats = buildEventStatsMap(events);

  return DRIVE_EVENT_TYPES.filter((type) => stats[type].count > 0).map((type) => ({
    type,
    count: stats[type].count,
    peak: stats[type].peak,
    unit: stats[type].unit,
    totalPenalty: stats[type].count,
  }));
}

export function formatEventValue(type: DriveEventType, value: number, unit: string) {
  if (value === 0) return '—';
  if (type === 'harsh_brake') return `${value.toFixed(1)} ${unit}`;
  if (type === 'aggressive_steering') return `${Math.round(Math.abs(value))} ${unit}`;
  if (unit === '°') return `${Math.abs(value).toFixed(0)}${unit}`;
  return `${Math.abs(value).toFixed(1)} ${unit}`;
}

export function formatPeakValue(type: DriveEventType, peak: number, unit: string) {
  if (peak === 0) return '—';
  return `peak ${formatEventValue(type, peak, unit)}`;
}
