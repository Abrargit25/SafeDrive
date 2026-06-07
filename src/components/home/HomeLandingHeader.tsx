import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  scale?: number;
};

export function HomeLandingHeader({ title, subtitle, scale = 1 }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Ionicons name="shield-checkmark" size={Math.round(30 * scale)} color="#22C55E" />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { fontSize: Math.round(22 * scale) }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontSize: Math.round(14 * scale) }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
    fontWeight: '500',
  },
});
