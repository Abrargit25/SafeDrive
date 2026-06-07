import { thresholds } from '@/constants/thresholds';

/** Sudden forward deceleration — phone lurches forward when vehicle brakes hard. */
export class HarshBrakeDetector {
  detect(forwardAccelerationY: number) {
    return forwardAccelerationY < thresholds.harshBrake;
  }
}
