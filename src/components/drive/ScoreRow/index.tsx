import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type Props = {
  label: string;
  value: number;
  positive?: boolean;
};

export function ScoreRow({ label, value, positive }: Props) {
  const display = positive ? `+${value}` : value > 0 ? `-${value}` : `${value}`;
  const color = positive ? palette.primary : value > 0 ? palette.red : palette.text;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  label: {
    fontSize: 15,
    color: palette.textSecondary,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
});
