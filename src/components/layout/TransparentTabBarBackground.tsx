import { StyleSheet, View } from 'react-native';

export function TransparentTabBarBackground() {
  return <View style={styles.bg} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
