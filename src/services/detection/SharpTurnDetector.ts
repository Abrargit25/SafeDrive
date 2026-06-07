import { thresholds } from '@/constants/thresholds';

export class SharpTurnDetector {
  detect(gyroZ: number) {
    return Math.abs(gyroZ) > thresholds.sharpTurn;
  }
}
