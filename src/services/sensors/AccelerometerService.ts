import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';

export class AccelerometerService {
  async isAvailable() {
    return Accelerometer.isAvailableAsync();
  }

  subscribe(callback: (reading: AccelerometerMeasurement) => void, interval = 100) {
    Accelerometer.setUpdateInterval(interval);
    return Accelerometer.addListener(callback);
  }
}
