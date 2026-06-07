import type { Subscription } from 'expo-sensors/build/DeviceSensor';

import { thresholds } from '@/constants/thresholds';
import type { SensorSnapshot } from '@/types/drive';

import { AccelerometerService } from './AccelerometerService';
import { GyroscopeService } from './GyroscopeService';
import { MagnetometerService } from './MagnetometerService';
import { MotionService } from './MotionService';

type SensorCallback = (snapshot: SensorSnapshot) => void;

export class SensorManager {
  private static instance: SensorManager;
  private subs: Subscription[] = [];
  private latest: Partial<SensorSnapshot> = {};
  private running = false;

  readonly accelerometer = new AccelerometerService();
  readonly gyroscope = new GyroscopeService();
  readonly magnetometer = new MagnetometerService();
  readonly motion = new MotionService();

  static getInstance() {
    if (!SensorManager.instance) {
      SensorManager.instance = new SensorManager();
    }
    return SensorManager.instance;
  }

  async start(onReading: SensorCallback) {
    if (this.running) return;
    this.running = true;
    this.latest = {};
    const interval = thresholds.sensorIntervalMs;

    const emit = () => {
      const s = this.latest;
      if (s.accelZ === undefined || s.gyroZ === undefined) return;
      onReading({
        accelX: s.accelX ?? 0,
        accelY: s.accelY ?? 0,
        accelZ: s.accelZ ?? 0,
        gyroX: s.gyroX ?? 0,
        gyroY: s.gyroY ?? 0,
        gyroZ: s.gyroZ ?? 0,
        motionX: s.motionX ?? 0,
        motionY: s.motionY ?? 0,
        motionZ: s.motionZ ?? 0,
        pitch: s.pitch,
        roll: s.roll,
        yaw: s.yaw,
        magX: s.magX,
        magY: s.magY,
        magZ: s.magZ,
      });
    };

    this.subs.push(
      this.accelerometer.subscribe((d) => {
        this.latest.accelX = d.x;
        this.latest.accelY = d.y;
        this.latest.accelZ = d.z;
        emit();
      }, interval),
    );

    this.subs.push(
      this.gyroscope.subscribe((d) => {
        this.latest.gyroX = d.x;
        this.latest.gyroY = d.y;
        this.latest.gyroZ = d.z;
      }, interval),
    );

    this.subs.push(
      this.motion.subscribe((d) => {
        const a = d.acceleration;
        if (a) {
          this.latest.motionX = a.x;
          this.latest.motionY = a.y;
          this.latest.motionZ = a.z;
        }
        const r = d.rotation;
        if (r) {
          this.latest.pitch = r.beta;
          this.latest.roll = r.gamma;
          this.latest.yaw = r.alpha;
        }
      }, interval),
    );

    const magAvailable = await this.magnetometer.isAvailable();
    if (magAvailable) {
      this.subs.push(
        this.magnetometer.subscribe((d) => {
          this.latest.magX = d.x;
          this.latest.magY = d.y;
          this.latest.magZ = d.z;
        }, interval),
      );
    }
  }

  stop() {
    this.subs.forEach((s) => s.remove());
    this.subs = [];
    this.latest = {};
    this.running = false;
  }

  isRunning() {
    return this.running;
  }
}
