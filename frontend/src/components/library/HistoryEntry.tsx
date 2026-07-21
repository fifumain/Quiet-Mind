import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedEntrance } from '../common/AnimatedEntrance';
import { GlareHover } from '../common/GlareHover';
import { GlowBorder } from '../common/GlowBorder';
import { glassBlur, theme } from '../../theme/theme';

interface HistoryEntryProps {
  index: number;
  isLast: boolean;
  isCurrent: boolean;
  dateLabel: string;
  title: string;
  subtitle: string;
  body?: string;
  onPress: () => void;
}

/**
 * One row of the history timeline: a rail (dot + connecting line down to the
 * next entry) alongside the card itself. The line is a real child element
 * inside cardWrap rather than a margin/gap, so the row's own cross-axis
 * stretch carries it all the way down to the next dot with no visual break.
 */
export function HistoryEntry({ index, isLast, isCurrent, dateLabel, title, subtitle, body, onPress }: HistoryEntryProps) {
  const card = (
    <GlareHover style={[styles.card, isCurrent && styles.cardCurrent, glassBlur(12)]}>
      <Pressable onPress={onPress} style={styles.pressable}>
        <View style={styles.cardHeader}>
          <Text style={styles.date}>{dateLabel}</Text>
          {isCurrent ? (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>CURRENT</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={4}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {body ? (
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        ) : null}
      </Pressable>
    </GlareHover>
  );

  return (
    <AnimatedEntrance index={index} style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, isCurrent && styles.dotCurrent]} />
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.cardWrap}>
        {isCurrent ? <GlowBorder radius={theme.radius.md}>{card}</GlowBorder> : card}
        {!isLast ? <View style={styles.spacer} /> : null}
      </View>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.md },
  rail: { width: 12, alignItems: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.glass.fillStrong,
    borderWidth: 2,
    borderColor: theme.glass.borderStrong,
    marginTop: 6,
  },
  dotCurrent: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  line: { flex: 1, width: 2, backgroundColor: theme.glass.border, marginTop: 4 },
  cardWrap: { flex: 1 },
  spacer: { height: theme.spacing.lg },
  card: {
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
  },
  cardCurrent: { borderColor: theme.colors.accent },
  pressable: { padding: theme.spacing.md, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  currentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  currentPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: theme.gradient[0] },
  title: { fontSize: theme.fontSize.md, lineHeight: 22, fontWeight: '600', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  body: { fontSize: theme.fontSize.xs, lineHeight: 18, color: theme.colors.textMuted },
});
