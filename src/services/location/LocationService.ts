import * as Location from 'expo-location';

export class LocationService {
  async getCurrentPosition() {
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  }

  async watchPosition(callback: Location.LocationCallback) {
    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 1000,
      },
      callback,
    );
  }
}
