import { Gyroscope, type GyroscopeMeasurement } from 'expo-sensors';

export class GyroscopeService {
  async isAvailable() {
    return Gyroscope.isAvailableAsync();
  }

  subscribe(callback: (reading: GyroscopeMeasurement) => void, interval = 100) {
    Gyroscope.setUpdateInterval(interval);
    return Gyroscope.addListener(callback);
  }
}
