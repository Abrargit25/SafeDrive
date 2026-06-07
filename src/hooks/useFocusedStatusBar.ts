import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

import { palette } from '@/theme/colors';

type StatusBarStyle = 'light' | 'dark' | 'auto';

type Options = {
  style: StatusBarStyle;
  /** When true, content draws under the status bar (immersive home / live drive). */
  translucent?: boolean;
  backgroundColor?: string;
};

/**
 * Apply status bar + Android nav bar only while this screen is focused.
 * Tab screens stay mounted in the background — never put <StatusBar> in shared
 * layout components or inactive tabs will override the active screen.
 */
export function useFocusedStatusBar({
  style,
  translucent = false,
  backgroundColor = palette.background,
}: Options) {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style);

      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(translucent);
        RNStatusBar.setBackgroundColor(translucent ? 'transparent' : backgroundColor, !translucent);
        NavigationBar.setStyle(style === 'light' ? 'light' : 'dark');
      }
    }, [style, translucent, backgroundColor]),
  );
}
