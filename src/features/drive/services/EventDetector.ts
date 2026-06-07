import { thresholds } from '@/constants/thresholds';
import { AggressiveSteeringDetector } from '@/services/detection/AggressiveSteeringDetector';
import { ExcessiveMovementDetector } from '@/services/detection/ExcessiveMovementDetector';
import { HarshAccelerationDetector } from '@/services/detection/HarshAccelerationDetector';
import { HarshBrakeDetector } from '@/services/detection/HarshBrakeDetector';
import { PhoneHandlingDetector } from '@/services/detection/PhoneHandlingDetector';
import { SharpTurnDetector } from '@/services/detection/SharpTurnDetector';
import { buildDetectedEvent } from '@/services/scoring/ScoreEngine';
import type { DetectedEvent, SensorSnapshot } from '@/types/drive';

export class EventDetector {
  private readonly harshBrake = new HarshBrakeDetector();
  private readonly harshAcceleration = new HarshAccelerationDetector();
  private readonly sharpTurn = new SharpTurnDetector();
  private readonly aggressiveSteering = new AggressiveSteeringDetector();
  private readonly movement = new ExcessiveMovementDetector();
  private readonly phone = new PhoneHandlingDetector();
  private lastFired: Partial<Record<DetectedEvent['type'], number>> = {};

  check(snapshot: SensorSnapshot): DetectedEvent[] {
    const now = Date.now();
    const events: DetectedEvent[] = [];
    const speedKmh = snapshot.speedKmh ?? 0;

    if (this.canFire('harsh_brake', now) && this.harshBrake.detect(snapshot.accelY)) {
      events.push(buildDetectedEvent('harsh_brake', snapshot.accelY, speedKmh));
      this.fire('harsh_brake', now);
    }

    if (
      this.canFire('harsh_acceleration', now) &&
      this.harshAcceleration.detect(snapshot.accelY)
    ) {
      events.push(buildDetectedEvent('harsh_acceleration', snapshot.accelY, speedKmh));
      this.fire('harsh_acceleration', now);
    }

    if (this.canFire('sharp_turn', now) && this.sharpTurn.detect(snapshot.gyroZ)) {
      events.push(buildDetectedEvent('sharp_turn', snapshot.gyroZ, speedKmh));
      this.fire('sharp_turn', now);

      if (
        this.canFire('aggressive_steering', now) &&
        this.aggressiveSteering.onSharpTurn(now)
      ) {
        const turnCount = thresholds.aggressiveSteeringTurns;
        events.push(buildDetectedEvent('aggressive_steering', turnCount, speedKmh));
        this.fire('aggressive_steering', now);
      }
    }

    const vehicleAccelFired = events.some(
      (e) => e.type === 'harsh_brake' || e.type === 'harsh_acceleration',
    );
    if (
      !vehicleAccelFired &&
      this.canFire('excessive_movement', now) &&
      this.movement.detect(snapshot.accelX, snapshot.accelY)
    ) {
      const spike = Math.max(Math.abs(snapshot.accelX), Math.abs(snapshot.accelY));
      events.push(buildDetectedEvent('excessive_movement', spike, speedKmh));
      this.fire('excessive_movement', now);
    }

    if (
      snapshot.pitch !== undefined &&
      snapshot.roll !== undefined &&
      this.canFire('phone_handling', now)
    ) {
      const orientationDelta = this.phone.detectWithDelta({
        pitchRad: snapshot.pitch,
        rollRad: snapshot.roll,
        speedKmh,
        accelX: snapshot.accelX,
        accelY: snapshot.accelY,
      });
      if (orientationDelta > 0) {
        events.push(buildDetectedEvent('phone_handling', orientationDelta, speedKmh));
        this.fire('phone_handling', now);
      }
    }

    return events;
  }

  private canFire(type: DetectedEvent['type'], now: number) {
    const last = this.lastFired[type] ?? 0;
    return now - last >= thresholds.cooldowns[type];
  }

  private fire(type: DetectedEvent['type'], now: number) {
    this.lastFired[type] = now;
  }

  reset() {
    this.lastFired = {};
    this.aggressiveSteering.reset();
    this.phone.reset();
  }
}
