import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type Variant = 'primary' | 'secondary' | 'danger' | 'purple' | 'ghost';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: palette.primary, text: '#fff' },
  secondary: { bg: palette.surface, text: palette.text, border: palette.border },
  danger: { bg: palette.red, text: '#fff' },
  purple: { bg: palette.purple, text: '#fff' },
  ghost: { bg: 'transparent', text: palette.textSecondary },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  fullWidth = true,
}: Props) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.full,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? v.bg,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.inner}>
          {icon ? <Ionicons name={icon} size={18} color={v.text} /> : null}
          <Text style={[styles.label, { color: v.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  full: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
