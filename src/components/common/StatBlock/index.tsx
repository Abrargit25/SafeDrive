import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  value: string;
  icon?: IconName;
  iconColor?: string;
  align?: 'left' | 'center';
};

export function StatBlock({
  label,
  value,
  icon,
  iconColor = palette.blue,
  align = 'left',
}: Props) {
  const centered = align === 'center';

  return (
    <View style={[styles.wrap, centered && styles.wrapCenter]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      ) : centered ? (
        <View style={styles.iconPlaceholder} />
      ) : null}
      <Text style={[styles.label, centered && styles.textCenter]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.value, centered && styles.textCenter]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  wrapCenter: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
    lineHeight: 22,
  },
  textCenter: {
    textAlign: 'center',
    width: '100%',
  },
});
