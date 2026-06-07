import { thresholds } from '@/constants/thresholds';

/** Sudden forward acceleration — phone pushes back when vehicle accelerates hard. */
export class HarshAccelerationDetector {
  detect(forwardAccelerationY: number) {
    return forwardAccelerationY > thresholds.harshAcceleration;
  }
}
