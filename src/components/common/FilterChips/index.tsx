import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

type Option = {
  key: string;
  label: string;
};

type Props = {
  options: Option[];
  active: string;
  onChange: (key: string) => void;
  layout?: 'segmented' | 'scroll';
};

export function FilterChips({
  options,
  active,
  onChange,
  layout = 'segmented',
}: Props) {
  const useSegmented = layout === 'segmented' && options.length <= 4;

  if (useSegmented) {
    return (
      <View style={styles.segmented}>
        {options.map((opt) => {
          const selected = opt.key === active;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={[styles.segment, selected && styles.segmentActive]}
            >
              <Text style={[styles.text, selected && styles.textActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollWrap}
      contentContainerStyle={styles.scrollRow}
    >
      {options.map((opt) => {
        const selected = opt.key === active;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.chip, selected && styles.chipActive]}
          >
            <Text style={[styles.text, selected && styles.textActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  segmentActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  scrollWrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  scrollRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  textActive: {
    color: '#fff',
  },
});
