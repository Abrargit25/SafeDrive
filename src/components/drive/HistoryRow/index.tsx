import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { ScoreRing } from '@/components/drive/ScoreRing';
import { palette, scoreLabel } from '@/theme/colors';

type Props = {
  score: number;
  date: string;
  time: string;
  distance: string;
  duration: string;
  events?: number;
  hasAiSummary?: boolean;
  onPress?: () => void;
  onAiPress?: () => void;
};

export function HistoryRow({
  score,
  date,
  time,
  distance,
  duration,
  events,
  hasAiSummary = false,
  onPress,
  onAiPress,
}: Props) {
  return (
    <Card style={styles.card}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.rowPress, pressed && onPress && styles.pressed]}
      >
        <View style={styles.row}>
          <ScoreRing
            score={score}
            size={72}
            stroke={7}
            subtitle={scoreLabel(score)}
            showSubtitle={false}
          />

          <View style={styles.body}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.time}>{time}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="navigate-outline" size={13} color={palette.textMuted} />
                <Text style={styles.statText}>{distance}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={13} color={palette.textMuted} />
                <Text style={styles.statText}>{duration}</Text>
              </View>
              {events !== undefined ? (
                <View style={styles.stat}>
                  <Ionicons name="warning-outline" size={13} color={palette.textMuted} />
                  <Text style={styles.statText}>{events}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {onPress ? (
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
          ) : null}
        </View>
      </Pressable>

      {onAiPress ? (
        <Pressable
          onPress={onAiPress}
          style={({ pressed }) => [
            styles.aiBtn,
            hasAiSummary ? styles.aiBtnSaved : styles.aiBtnExplain,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={hasAiSummary ? 'sparkles' : 'bulb-outline'}
            size={16}
            color={hasAiSummary ? palette.purple : '#fff'}
          />
          <Text style={[styles.aiBtnText, hasAiSummary && styles.aiBtnTextSaved]}>
            {hasAiSummary ? 'View Explanation' : 'Explain'}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    paddingVertical: 14,
    gap: 12,
  },
  rowPress: {
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  time: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 2,
  },
  aiBtnExplain: {
    backgroundColor: palette.blue,
  },
  aiBtnSaved: {
    backgroundColor: `${palette.purple}14`,
    borderWidth: 1,
    borderColor: `${palette.purple}35`,
  },
  aiBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  aiBtnTextSaved: {
    color: palette.purple,
  },
  pressed: {
    opacity: 0.9,
  },
});
