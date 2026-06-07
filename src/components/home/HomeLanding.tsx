import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTabBarHeight } from '@/constants/layout';
import { getAdaptiveCoverLayout } from '@/utils/adaptiveImage';
import { HomeActionButton } from './HomeActionButton';
import { HomeLandingHeader } from './HomeLandingHeader';

const HOME_BG = require('../../../assets/HomeScreenBackgroundImg1.png');
const IMG = Image.resolveAssetSource(HOME_BG);

type Props = {
  onStartDrive: () => void;
  onViewDashboard: () => void;
  isDriving?: boolean;
};

export function HomeLanding({ onStartDrive, onViewDashboard, isDriving = false }: Props) {
  const { width: windowW, height: windowH } = useWindowDimensions();
  const screen = Dimensions.get('screen');
  const insets = useSafeAreaInsets();

  const uiScale = Math.min(Math.max(windowW / 390, 0.85), 1.15);
  const buttonHeight = Math.round(54 * uiScale);
  const buttonFont = Math.round(17 * uiScale);
  const headlineSize = Math.round(30 * uiScale);
  const subtitleSize = Math.round(16 * uiScale);
  const bottomPad = getTabBarHeight(insets.bottom) + (isDriving ? 76 : 8);

  const bgLayout = useMemo(
    () =>
      getAdaptiveCoverLayout(
        { width: screen.width, height: screen.height },
        { width: IMG.width, height: IMG.height },
        'bottom',
      ),
    [screen.width, screen.height, windowW, windowH],
  );

  return (
    <View style={styles.root}>
      <Image
        source={HOME_BG}
        style={{
          position: 'absolute',
          left: bgLayout.left,
          top: bgLayout.top,
          width: bgLayout.width,
          height: bgLayout.height,
        }}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* Gradient starts below status bar so the image shows through the status bar area */}
      <LinearGradient
        colors={['rgba(7, 87, 216, 0.35)', 'rgba(7, 87, 216, 0.1)', 'transparent']}
        locations={[0, 0.35, 0.75]}
        style={[styles.topFade, { top: insets.top, height: windowH * 0.38 }]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: bottomPad,
            paddingLeft: Math.max(insets.left, 12),
            paddingRight: Math.max(insets.right, 12),
          },
        ]}
      >
        <HomeLandingHeader
          title="Drive Safe"
          subtitle={isDriving ? 'Drive in progress — tap Resume below' : 'Every drive counts'}
          scale={uiScale}
        />

        {isDriving ? (
          <View style={styles.recordingBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
        ) : null}

        <View style={styles.copy}>
          <Text style={[styles.headline, { fontSize: headlineSize, lineHeight: headlineSize * 1.25 }]}>
            Ready to drive smarter?
          </Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleSize * 1.5 }]}>
            Track your drive, improve your score, stay safe on the road.
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          <HomeActionButton
            label={isDriving ? 'Resume Drive' : 'Start Drive'}
            icon={isDriving ? 'radio-button-on' : 'play'}
            onPress={onStartDrive}
            height={buttonHeight}
            fontSize={buttonFont}
          />
          <HomeActionButton
            label="View Dashboard"
            variant="secondary"
            onPress={onViewDashboard}
            height={buttonHeight}
            fontSize={buttonFont}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3B8FE8',
    overflow: 'hidden',
  },
  topFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  recordingText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  copy: {
    marginTop: 28,
    paddingHorizontal: 2,
    maxWidth: 340,
  },
  headline: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.94)',
    fontWeight: '500',
    marginTop: 12,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    gap: 12,
    paddingTop: 8,
  },
});
