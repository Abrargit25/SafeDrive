import { thresholds } from '@/constants/thresholds';

const toDegrees = (radians: number) => (radians * 180) / Math.PI;

type PhoneHandlingInput = {
  pitchRad: number;
  rollRad: number;
  speedKmh: number;
  accelX: number;
  accelY: number;
};

/**
 * Method 3: speed + orientation change + movement spike.
 * Returns orientation delta in degrees when triggered, otherwise 0.
 */
export class PhoneHandlingDetector {
  private baselinePitch?: number;
  private baselineRoll?: number;
  private baselineTime = 0;

  detectWithDelta({ pitchRad, rollRad, speedKmh, accelX, accelY }: PhoneHandlingInput) {
    if (speedKmh < thresholds.phoneHandlingMinSpeedKmh) {
      return 0;
    }

    const movementSpike =
      Math.abs(accelX) > thresholds.excessiveMovementAxis ||
      Math.abs(accelY) > thresholds.excessiveMovementAxis;
    if (!movementSpike) {
      return 0;
    }

    const now = Date.now();
    const pitch = toDegrees(pitchRad);
    const roll = toDegrees(rollRad);

    if (this.baselinePitch === undefined) {
      this.baselinePitch = pitch;
      this.baselineRoll = roll;
      this.baselineTime = now;
      return 0;
    }

    if (now - this.baselineTime > thresholds.phoneOrientationWindowMs) {
      this.baselinePitch = pitch;
      this.baselineRoll = roll;
      this.baselineTime = now;
      return 0;
    }

    const pitchChange = Math.abs(pitch - (this.baselinePitch ?? pitch));
    const rollChange = Math.abs(roll - (this.baselineRoll ?? roll));
    const orientationDelta = Math.max(pitchChange, rollChange);

    if (orientationDelta > thresholds.phoneOrientationChangeDeg) {
      this.baselinePitch = pitch;
      this.baselineRoll = roll;
      this.baselineTime = now;
      return orientationDelta;
    }

    return 0;
  }

  reset() {
    this.baselinePitch = undefined;
    this.baselineRoll = undefined;
    this.baselineTime = 0;
  }
}
