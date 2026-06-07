import { thresholds } from '@/constants/thresholds';

/** Phone movement independent of smooth vehicle motion (shake, drop, pickup). */
export class ExcessiveMovementDetector {
  detect(accelX: number, accelY: number) {
    return (
      Math.abs(accelX) > thresholds.excessiveMovementAxis ||
      Math.abs(accelY) > thresholds.excessiveMovementAxis
    );
  }
}
