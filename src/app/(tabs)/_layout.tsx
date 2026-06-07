import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransparentTabBarBackground } from '@/components/layout/TransparentTabBarBackground';
import { getTabBarHeight } from '@/constants/layout';
import { useAuth } from '@/features/auth/store/AuthContext';
import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabLayout() {
  const { loading, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/register" />;
  }
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const bottomPadding = Math.max(insets.bottom, 8);

  const solidTabBarStyle = {
    backgroundColor: palette.surface,
    borderTopColor: palette.borderLight,
    borderTopWidth: 1,
    height: tabBarHeight,
    paddingBottom: bottomPadding,
    paddingTop: 8,
    elevation: 8,
  };

  const homeTabBarStyle = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: tabBarHeight,
    paddingBottom: bottomPadding,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: solidTabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        sceneStyle: {
          backgroundColor: palette.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('home-outline'),
          tabBarStyle: homeTabBarStyle,
          tabBarBackground: TransparentTabBarBackground,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.85)',
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: tabIcon('time-outline') }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: tabIcon('bar-chart-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline') }}
      />
      <Tabs.Screen name="drive" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
