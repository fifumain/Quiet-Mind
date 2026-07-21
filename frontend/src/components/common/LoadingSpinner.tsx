import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, alignItems: 'center' },
});
