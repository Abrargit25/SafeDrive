import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { palette, scoreLabel } from '@/theme/colors';

type Props = {
  name: string;
  phone?: string;
  email?: string;
  badge?: string;
  avgScore?: number;
  initials?: string;
};

export function UserCard({
  name,
  phone,
  email,
  badge,
  avgScore,
  initials,
}: Props) {
  const letters = initials ?? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const contact = phone ?? email ?? '';
  const driverBadge = badge ?? (avgScore !== undefined ? scoreLabel(avgScore) + ' Driver' : 'SafeDrive User');

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{letters}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {contact ? <Text style={styles.contact}>{contact}</Text> : null}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{driverBadge}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  contact: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: `${palette.primary}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.primaryDark,
  },
});
