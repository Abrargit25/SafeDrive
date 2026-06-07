export const thresholds = {
  /** Forward-axis accelerometer reading (vehicle longitudinal spike). */
  harshBrake: -3.5,
  harshAcceleration: 3.5,
  /** Gyroscope yaw rate (rad/s). */
  sharpTurn: 2,
  aggressiveSteeringTurns: 3,
  aggressiveSteeringWindowMs: 5000,
  /** Raw accelerometer axis spike — phone shaken, dropped, or picked up. */
  excessiveMovementAxis: 5,
  phoneOrientationChangeDeg: 30,
  phoneOrientationWindowMs: 2000,
  phoneHandlingMinSpeedKmh: 15,
  cooldowns: {
    harsh_brake: 3000,
    harsh_acceleration: 3000,
    sharp_turn: 2000,
    aggressive_steering: 5000,
    excessive_movement: 3000,
    phone_handling: 3000,
  } as const,
  /** Detection sampling — 10 Hz balances responsiveness and battery use. */
  sensorIntervalMs: 100,
  /** How often live dashboard sensor text refreshes (detection still runs at sensorIntervalMs). */
  sensorUiRefreshMs: 500,
  minDriveDurationMs: 10_000,
} as const;
