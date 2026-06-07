import { Magnetometer, type MagnetometerMeasurement } from 'expo-sensors';

export class MagnetometerService {
  async isAvailable() {
    return Magnetometer.isAvailableAsync();
  }

  subscribe(callback: (reading: MagnetometerMeasurement) => void, interval = 100) {
    Magnetometer.setUpdateInterval(interval);
    return Magnetometer.addListener(callback);
  }
}
