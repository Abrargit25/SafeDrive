import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  icon?: IconName;
  title: string;
  message?: string;
};

export function EmptyState({ icon = 'document-text-outline', title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={palette.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  message: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
