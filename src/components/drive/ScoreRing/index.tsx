import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { palette, scoreColor } from '@/theme/colors';

type Props = {
  score: number;
  max?: number;
  size?: number;
  stroke?: number;
  subtitle?: string;
  showSubtitle?: boolean;
};

export function ScoreRing({
  score,
  max = 100,
  size = 120,
  stroke = 10,
  subtitle = 'Good',
  showSubtitle = true,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / max, 1);
  const offset = circumference * (1 - progress);
  const color = scoreColor(score);
  const scale = size / 120;
  const scoreFontSize = Math.max(14, Math.round(32 * scale));
  const maxFontSize = Math.max(10, Math.round(12 * scale));
  const subFontSize = Math.max(9, Math.round(12 * scale));
  const compact = size < 90;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.borderLight}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap={compact ? 'butt' : 'round'}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { fontSize: scoreFontSize, lineHeight: scoreFontSize + 2 }]}>
          {score}
        </Text>
        {!compact ? (
          <Text style={[styles.max, { fontSize: maxFontSize }]}>/{max}</Text>
        ) : null}
        {showSubtitle ? (
          <Text style={[styles.sub, { color, fontSize: subFontSize }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '700',
    color: palette.text,
  },
  max: {
    color: palette.textMuted,
    marginTop: -2,
  },
  sub: {
    fontWeight: '600',
    marginTop: 1,
  },
});
