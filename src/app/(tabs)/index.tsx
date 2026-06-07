import { router } from 'expo-router';
import { Alert } from 'react-native';

import { HomeLanding } from '@/components';
import { useDrive } from '@/features/drive/store/DriveContext';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';

export default function HomeScreen() {
  const { isDriving, startDrive } = useDrive();

  useFocusedStatusBar({ style: 'light', translucent: true });

  const handleStart = async () => {
    if (isDriving) {
      router.push('/(tabs)/drive');
      return;
    }
    const ok = await startDrive();
    if (ok) router.push('/(tabs)/drive');
    else Alert.alert('Could not start', 'Check location permissions and try again.');
  };

  return (
    <HomeLanding
      isDriving={isDriving}
      onStartDrive={handleStart}
      onViewDashboard={() => router.push('/(tabs)/analytics')}
    />
  );
}
