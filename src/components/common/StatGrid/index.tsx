import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  children: ReactNode;
  columns?: 2 | 3;
};

export function StatGrid({ children }: Props) {
  const items = Children.toArray(children);

  return (
    <View style={styles.grid}>
      {items.map((child, index) => (
        <View key={index} style={styles.cell}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
