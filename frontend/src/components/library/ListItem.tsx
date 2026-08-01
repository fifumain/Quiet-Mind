import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '../common/AppText';
import { HeartButton } from '../common/HeartButton';
import { ShapeBlurCard } from '../common/ShapeBlurCard';
import { glassBlur, theme } from '../../theme/theme';

interface ListItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const ListItem = memo(function ListItem({ title, subtitle, onPress, isFavorited, onToggleFavorite }: ListItemProps) {
  return (
    <ShapeBlurCard style={[styles.container, glassBlur(16)]}>
      <Pressable style={styles.pressable} onPress={onPress}>
        <Text style={styles.title} numberOfLines={4}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Pressable>
      {onToggleFavorite ? (
        // Sibling to the navigation Pressable above, not nested inside it —
        // keeps the heart tap from also triggering navigation.
        <HeartButton isFavorited={!!isFavorited} onPress={onToggleFavorite} style={styles.heart} />
      ) : null}
    </ShapeBlurCard>
  );
})

const styles = StyleSheet.create({
  container: {
    flex: 1, // fill the grid cell so cards in one row share the same height
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
  },
  pressable: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  heart: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  title: { fontSize: theme.fontSize.sm, lineHeight: 23, fontWeight: '600', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
});
