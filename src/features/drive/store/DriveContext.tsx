import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { thresholds } from '@/constants/thresholds';
import { EventDetector } from '@/features/drive/services/EventDetector';
import { ScoreEngine } from '@/services/scoring/ScoreEngine';
import { RatingEngine } from '@/services/scoring/RatingEngine';
import { LocationService } from '@/services/location/LocationService';
import { SensorManager } from '@/services/sensors/SensorManager';
import { buildSensorStats, getDriveSessionDetails } from '@/db/databasehelper';
import {
  createActiveSession,
  initSessionStorage,
  loadSessions,
  saveSession,
} from '@/services/storage/SessionStorage';
import type { AccelerationReading, DetectedEvent, DriveEvent, DriveSession } from '@/types/drive';
import { buildEventCountMap } from '@/utils/eventStats';
import { requestDrivePermissions } from '@/utils/permissions';
import { calculateMagnitude } from '@/utils/calculations';

type DriveContextValue = {
  active: DriveSession | null;
  completed: DriveSession | null;
  history: DriveSession[];
  isDriving: boolean;
  elapsedMs: number;
  speedKmh: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  gpsStatus: 'Strong' | 'Weak' | 'Searching';
  sensorsActive: boolean;
  rating: string;
  eventCounts: Record<string, number>;
  currentAcceleration: AccelerationReading | null;
  readings: { accel: string; gyro: string; motion: string; mag: string };
  startDrive: () => Promise<boolean>;
  endDrive: () => Promise<DriveSession | null>;
  refreshHistory: () => Promise<void>;
  openHistorySession: (sessionId: string) => Promise<void>;
};

const DriveContext = createContext<DriveContextValue | null>(null);

const ratingEngine = new RatingEngine();
const scoreEngine = new ScoreEngine();
const detector = new EventDetector();

export function DriveProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DriveSession | null>(null);
  const [completed, setCompleted] = useState<DriveSession | null>(null);
  const [history, setHistory] = useState<DriveSession[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(0);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<'Strong' | 'Weak' | 'Searching'>('Searching');
  const [sensorsActive, setSensorsActive] = useState(false);
  const [currentAcceleration, setCurrentAcceleration] = useState<AccelerationReading | null>(null);
  const [readings, setReadings] = useState({
    accel: '—',
    gyro: '—',
    motion: '—',
    mag: '—',
  });
  const locationRef = useRef(new LocationService());
  const locSubRef = useRef<{ remove: () => void } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedSamplesRef = useRef<number[]>([]);
  const speedKmhRef = useRef(0);
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const activeRef = useRef<DriveSession | null>(null);
  const sensorStatsRef = useRef({
    accelSum: 0,
    accelCount: 0,
    maxAccel: 0,
    rotationSum: 0,
    rotationCount: 0,
    maxRotation: 0,
  });
  const readingsRef = useRef({
    accel: '—',
    gyro: '—',
    motion: '—',
    mag: '—',
  });
  const lastReadingsFlushRef = useRef(0);
  const sensorsMarkedActiveRef = useRef(false);
  const speedSampleSumRef = useRef(0);

  const stopDriveTracking = useCallback(() => {
    SensorManager.getInstance().stop();
    setSensorsActive(false);
    sensorsMarkedActiveRef.current = false;
    locSubRef.current?.remove();
    locSubRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopDriveTracking(), [stopDriveTracking]);

  const syncActive = useCallback((session: DriveSession | null) => {
    activeRef.current = session;
    setActive(session);
  }, []);

  const patchActive = useCallback((patch: (session: DriveSession) => DriveSession) => {
    const current = activeRef.current;
    if (!current) return;
    const next = patch(current);
    activeRef.current = next;
    setActive(next);
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistory(await loadSessions());
  }, []);

  useEffect(() => {
    initSessionStorage()
      .then(refreshHistory)
      .catch((error) => {
        console.warn('Failed to initialize drive storage', error);
      });
  }, [refreshHistory]);

  const openHistorySession = useCallback(async (sessionId: string) => {
    const details = await getDriveSessionDetails(Number(sessionId));
    if (!details?.session) return;
    setCompleted(details.session);
    router.push('/drive-summary');
  }, []);

  const pushEvents = useCallback(
    (detected: DetectedEvent[]) => {
      if (!detected.length) return;
      patchActive((session) => {
        const newEvents: DriveEvent[] = [...session.events];
        for (const d of detected) {
          newEvents.push({
            id: `${Date.now()}-${d.type}-${newEvents.length}`,
            type: d.type,
            timestamp: Date.now(),
            value: d.value,
            unit: d.unit,
            severity: d.severity,
            speedKmh: d.speedKmh,
          });
        }
        return { ...session, events: newEvents };
      });
    },
    [patchActive],
  );

  const startDrive = useCallback(async () => {
    const granted = await requestDrivePermissions();
    if (!granted) return false;

    detector.reset();
    speedSamplesRef.current = [];
    lastCoordsRef.current = null;
    sensorStatsRef.current = {
      accelSum: 0,
      accelCount: 0,
      maxAccel: 0,
      rotationSum: 0,
      rotationCount: 0,
      maxRotation: 0,
    };

    const startedAt = Date.now();
    const dbSessionId = await createActiveSession(startedAt);

    const session: DriveSession = {
      id: String(dbSessionId),
      dbSessionId,
      startedAt,
      score: 100,
      distanceMeters: 0,
      events: [],
    };
    syncActive(session);
    setCompleted(null);
    setElapsedMs(0);
    speedKmhRef.current = 0;
    setSpeedKmh(0);
    setMaxSpeedKmh(0);
    setAvgSpeedKmh(0);
    setGpsStatus('Searching');
    setCurrentAcceleration(null);
    readingsRef.current = { accel: '—', gyro: '—', motion: '—', mag: '—' };
    lastReadingsFlushRef.current = 0;
    sensorsMarkedActiveRef.current = false;
    speedSampleSumRef.current = 0;

    const sensors = SensorManager.getInstance();
    await sensors.start((snapshot) => {
      const magnitude = calculateMagnitude(snapshot.accelX, snapshot.accelY, snapshot.accelZ);
      const rotation = Math.abs(snapshot.gyroZ);
      const stats = sensorStatsRef.current;
      stats.accelSum += magnitude;
      stats.accelCount += 1;
      stats.maxAccel = Math.max(stats.maxAccel, magnitude);
      stats.rotationSum += rotation;
      stats.rotationCount += 1;
      stats.maxRotation = Math.max(stats.maxRotation, rotation);

      readingsRef.current = {
        accel: `Y ${snapshot.accelY.toFixed(2)}g`,
        gyro: `Z ${snapshot.gyroZ.toFixed(2)} rad/s`,
        motion: `Z ${snapshot.motionZ.toFixed(2)}`,
        mag: snapshot.magZ !== undefined ? `${snapshot.magZ.toFixed(1)} µT` : 'n/a',
      };

      const now = Date.now();
      if (now - lastReadingsFlushRef.current >= thresholds.sensorUiRefreshMs) {
        lastReadingsFlushRef.current = now;
        setReadings(readingsRef.current);
      }

      if (!sensorsMarkedActiveRef.current) {
        sensorsMarkedActiveRef.current = true;
        setSensorsActive(true);
      }

      const detected = detector.check({ ...snapshot, speedKmh: speedKmhRef.current });
      if (detected.length) pushEvents(detected);
    });

    locSubRef.current = await locationRef.current.watchPosition((loc) => {
      const speed = Math.max(0, (loc.coords.speed ?? 0) * 3.6);
      speedKmhRef.current = speed;
      setSpeedKmh(speed);
      setMaxSpeedKmh((prev) => Math.max(prev, speed));
      speedSamplesRef.current.push(speed);
      speedSampleSumRef.current += speed;
      setAvgSpeedKmh(speedSampleSumRef.current / speedSamplesRef.current.length);

      const accuracy = loc.coords.accuracy ?? 999;
      const nextGpsStatus = accuracy <= 25 ? 'Strong' : 'Weak';
      setGpsStatus((prev) => (prev === nextGpsStatus ? prev : nextGpsStatus));

      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      const prev = lastCoordsRef.current;
      if (prev) {
        const dLat = ((lat - prev.lat) * Math.PI) / 180;
        const dLon = ((lon - prev.lon) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((prev.lat * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const meters = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (meters > 0) {
          patchActive((s) => ({ ...s, distanceMeters: s.distanceMeters + meters }));
        }
      }
      lastCoordsRef.current = { lat, lon };
    });

    timerRef.current = setInterval(() => {
      setElapsedMs((ms) => ms + 1000);
    }, 1000);

    return true;
  }, [patchActive, pushEvents, syncActive]);

  const endDrive = useCallback(async () => {
    stopDriveTracking();

    const raw = activeRef.current
      ? { ...activeRef.current, endedAt: Date.now() }
      : null;

    if (raw) {
      const scoredEvents = scoreEngine.finalizeEvents(raw.events);
      const finished: DriveSession = {
        ...raw,
        events: scoredEvents,
        score: scoreEngine.calculate(scoredEvents),
      };
      const samples = speedSamplesRef.current;
      const avgSpeedKmh = samples.length
        ? samples.reduce((sum, value) => sum + value, 0) / samples.length
        : 0;
      const maxSpeedKmh = samples.length ? Math.max(...samples) : 0;
      const phoneMovements = scoredEvents.filter((event) => event.type === 'phone_handling').length;

      await saveSession(finished, {
        maxSpeedKmh,
        avgSpeedKmh,
        safetyRating: ratingEngine.getRating(finished.score),
        sensorStats: buildSensorStats({
          ...sensorStatsRef.current,
          phoneMovements,
        }),
      });
      setCompleted(finished);
      await refreshHistory();
      router.replace('/drive-summary');
      syncActive(null);
      return finished;
    }

    return null;
  }, [refreshHistory, stopDriveTracking, syncActive]);

  const eventCounts = useMemo(
    () => buildEventCountMap((active ?? completed)?.events),
    [active?.events, completed?.events],
  );

  const rating = useMemo(() => {
    const score = active?.score ?? completed?.score ?? 100;
    return ratingEngine.getRating(score);
  }, [active, completed]);

  const contextValue = useMemo<DriveContextValue>(
    () => ({
      active,
      completed,
      history,
      isDriving: !!active,
      elapsedMs,
      speedKmh,
      maxSpeedKmh,
      avgSpeedKmh,
      gpsStatus,
      sensorsActive,
      rating,
      eventCounts,
      currentAcceleration,
      readings,
      startDrive,
      endDrive,
      refreshHistory,
      openHistorySession,
    }),
    [
      active,
      completed,
      history,
      elapsedMs,
      speedKmh,
      maxSpeedKmh,
      avgSpeedKmh,
      gpsStatus,
      sensorsActive,
      rating,
      eventCounts,
      currentAcceleration,
      readings,
      startDrive,
      endDrive,
      refreshHistory,
      openHistorySession,
    ],
  );

  return <DriveContext.Provider value={contextValue}>{children}</DriveContext.Provider>;
}

export function useDrive() {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error('useDrive must be used within DriveProvider');
  return ctx;
}
