import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { GlareHover } from '../common/GlareHover';
import { glassBlur, theme } from '../../theme/theme';

interface SavedCardProps {
  title: string;
  subtitle: string;
  savedAtLabel: string;
  onPress: () => void;
  onRemove: () => void;
}

/**
 * Favorites get their own card treatment, distinct from the plain catalog
 * ListItem — a rose-tinted border (theme.colors.danger, otherwise unused
 * outside error states) gives this screen its own visual identity, the
 * heart glyph pops in on mount, and GlareHover adds the same premium sweep
 * used on the History timeline.
 */
export function SavedCard({ title, subtitle, savedAtLabel, onPress, onRemove }: SavedCardProps) {
  return (
    <GlareHover style={[styles.card, glassBlur(14)]}>
      <Pressable style={styles.pressable} onPress={onPress}>
        <Text style={styles.title} numberOfLines={4}>
          {title}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <Text style={styles.savedAt}>{savedAtLabel}</Text>
        </View>
      </Pressable>
      <Pressable hitSlop={8} style={styles.heartWrap} onPress={onRemove}>
        <Animated.Text entering={ZoomIn.springify().damping(9)} style={styles.heart}>
          ♥
        </Animated.Text>
      </Pressable>
    </GlareHover>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: 'rgba(232,176,160,0.35)',
    borderRadius: theme.radius.md,
  },
  pressable: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md, justifyContent: 'space-between' },
  footer: { gap: 2 },
  heartWrap: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm, padding: theme.spacing.xs },
  heart: { fontSize: 20, color: theme.colors.danger },
  title: { fontSize: theme.fontSize.sm, lineHeight: 23, fontWeight: '600', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
  savedAt: { fontSize: 11, color: theme.colors.textMuted },
});
