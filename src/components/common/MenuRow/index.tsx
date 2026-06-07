import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  icon: IconName;
  iconColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
};

export function MenuRow({
  label,
  icon,
  iconColor = palette.blue,
  onPress,
  showChevron = true,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: palette.text,
  },
});
