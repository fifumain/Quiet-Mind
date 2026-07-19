import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, alignItems: 'center' },
  text: { fontSize: theme.fontSize.md, color: '#666', textAlign: 'center' },
});
