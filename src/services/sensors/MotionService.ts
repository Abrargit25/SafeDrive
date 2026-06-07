import { DeviceMotion, type DeviceMotionMeasurement } from 'expo-sensors';

export class MotionService {
  async isAvailable() {
    return DeviceMotion.isAvailableAsync();
  }

  subscribe(callback: (reading: DeviceMotionMeasurement) => void, interval = 100) {
    DeviceMotion.setUpdateInterval(interval);
    return DeviceMotion.addListener(callback);
  }
}
