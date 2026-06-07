import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Card } from '@/components/common/Card';
import { palette } from '@/theme/colors';

type Segment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  title?: string;
  segments: Segment[];
  total: number;
};

export function EventChart({ title = 'Event Breakdown', segments, total }: Props) {
  const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
  const size = 140;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>
        <View style={styles.chart}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={palette.borderLight}
              strokeWidth={stroke}
              fill="none"
            />
            {segments.map((seg) => {
              const len = (seg.value / sum) * circumference;
              const dash = `${len} ${circumference - len}`;
              const el = (
                <Circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              );
              offset += len;
              return el;
            })}
          </Svg>
          <View style={styles.center}>
            <Text style={styles.total}>{total}</Text>
            <Text style={styles.sub}>events</Text>
          </View>
        </View>
        <View style={styles.legend}>
          {segments.map((seg) => (
            <View key={seg.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: seg.color }]} />
              <Text style={styles.legendLabel}>{seg.label}</Text>
              <Text style={styles.legendVal}>{seg.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 12,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  chart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  total: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.text,
  },
  sub: {
    fontSize: 12,
    color: palette.textMuted,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: palette.textSecondary,
  },
  legendVal: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
});
