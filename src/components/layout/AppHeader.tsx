import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  leftIcon?: IconName;
  onLeftPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  leftIcon = 'menu-outline',
  onLeftPress,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable onPress={onBack} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </Pressable>
        ) : onLeftPress ? (
          <Pressable onPress={onLeftPress} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name={leftIcon} size={22} color={palette.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      <View style={styles.center}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.side}>
        {rightIcon && onRightPress ? (
          <Pressable onPress={onRightPress} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name={rightIcon} size={22} color={palette.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  side: {
    width: 40,
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 2,
  },
});
