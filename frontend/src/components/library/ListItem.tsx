import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme/theme';

interface ListItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function ListItem({ title, subtitle, onPress }: ListItemProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: theme.spacing.xs,
  },
  title: { fontSize: theme.fontSize.md },
  subtitle: { fontSize: theme.fontSize.sm, color: '#888' },
});
