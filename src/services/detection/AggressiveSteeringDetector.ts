import { thresholds } from '@/constants/thresholds';

export class AggressiveSteeringDetector {
  private turnTimestamps: number[] = [];

  onSharpTurn(now: number) {
    this.turnTimestamps.push(now);
    this.turnTimestamps = this.turnTimestamps.filter(
      (t) => now - t <= thresholds.aggressiveSteeringWindowMs,
    );
    return this.turnTimestamps.length >= thresholds.aggressiveSteeringTurns;
  }

  reset() {
    this.turnTimestamps = [];
  }
}
