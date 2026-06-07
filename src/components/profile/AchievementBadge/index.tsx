import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  icon: IconName;
  color?: string;
  unlocked?: boolean;
};

export function AchievementBadge({
  label,
  icon,
  color = palette.yellow,
  unlocked = true,
}: Props) {
  return (
    <View style={[styles.wrap, !unlocked && styles.locked]}>
      <View style={[styles.circle, { backgroundColor: unlocked ? `${color}25` : palette.borderLight }]}>
        <Ionicons
          name={icon}
          size={24}
          color={unlocked ? color : palette.textMuted}
        />
      </View>
      <Text style={[styles.label, !unlocked && styles.labelLocked]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 80,
    alignItems: 'center',
    gap: 8,
  },
  locked: {
    opacity: 0.5,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
  },
  labelLocked: {
    color: palette.textMuted,
  },
});
