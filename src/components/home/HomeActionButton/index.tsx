import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
  height?: number;
  fontSize?: number;
};

export function HomeActionButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  height = 56,
  fontSize = 17,
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        { height, borderRadius: height / 2 },
        pressed && styles.pressed,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={['#2DD46B', palette.primary, palette.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, { height, borderRadius: height / 2 }]}
        >
          <ButtonInner label={label} icon={icon} color="#FFFFFF" fontSize={fontSize} />
        </LinearGradient>
      ) : (
        <View style={[styles.button, styles.secondary, { height, borderRadius: height / 2 }]}>
          <ButtonInner label={label} color="#0F2D52" fontSize={fontSize} />
        </View>
      )}
    </Pressable>
  );
}

function ButtonInner({
  label,
  icon,
  color,
  fontSize,
}: {
  label: string;
  icon?: IconName;
  color: string;
  fontSize: number;
}) {
  return (
    <View style={styles.inner}>
      {icon ? (
        <View style={styles.iconBadge}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
      ) : null}
      <Text style={[styles.label, { color, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
