import * as Location from 'expo-location';
import { Alert } from 'react-native';

export async function requestLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  return foreground.granted;
}

export async function requestDrivePermissions() {
  const location = await Location.requestForegroundPermissionsAsync();
  if (!location.granted) {
    Alert.alert('Permission needed', 'Location access is required to track your drive.');
    return false;
  }
  return true;
}
