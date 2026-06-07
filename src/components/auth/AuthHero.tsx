import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/theme/colors';

const badges = [
  { label: 'No Over-Speeding', color: palette.red },
  { label: 'Avoid Road Rage', color: palette.orange },
  { label: 'No Stunts', color: palette.blue },
  { label: 'Zero Challans', color: palette.purple },
];

type Props = {
  title?: string;
  subtitle?: string;
};

export function AuthHero({
  title = 'Drive Safe. Stay Smart.',
  subtitle = 'Create your account and join thousands of responsible drivers',
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0B1F4A', '#1E4FD6', '#2563EB']}
      style={[styles.hero, { paddingTop: insets.top + 28 }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark" size={36} color={palette.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.badges}>
        {badges.map((badge) => (
          <View key={badge.label} style={styles.badge}>
            <View style={[styles.dot, { backgroundColor: badge.color }]} />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
});
