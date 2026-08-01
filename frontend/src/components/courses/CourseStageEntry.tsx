import Check from 'lucide-react-native/icons/check';
import Lock from 'lucide-react-native/icons/lock';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { AnimatedEntrance } from '../common/AnimatedEntrance';
import { GlareHover } from '../common/GlareHover';
import { GlowBorder } from '../common/GlowBorder';
import { glassBlur, theme } from '../../theme/theme';

export type StageStatus = 'completed' | 'current' | 'locked';

interface CourseStageEntryProps {
  index: number;
  isLast: boolean;
  status: StageStatus;
  stageNumber: number;
  title: string;
  preview?: string;
  onPress: () => void;
}

/**
 * Runner timeline row — adapts HistoryEntry's rail/dot/line/card to a three-state
 * course stage. Content is always shown and tappable (soft gating); "locked" only
 * dims to hint sequence.
 */
export function CourseStageEntry({ index, isLast, status, stageNumber, title, preview, onPress }: CourseStageEntryProps) {
  const card = (
    <GlareHover style={[styles.card, status === 'current' && styles.cardCurrent, glassBlur(12)]}>
      <Pressable onPress={onPress} style={styles.pressable}>
        <View style={styles.cardHeader}>
          <Text style={styles.stageTitle} numberOfLines={2}>
            {title}
          </Text>
          {status === 'current' ? (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>CURRENT</Text>
            </View>
          ) : status === 'locked' ? (
            <View style={styles.lockPill}>
              <Lock size={11} color={theme.colors.textMuted} strokeWidth={2} />
            </View>
          ) : null}
        </View>
        {preview ? (
          <Text style={styles.preview} numberOfLines={2}>
            {preview}
          </Text>
        ) : null}
      </Pressable>
    </GlareHover>
  );

  return (
    <AnimatedEntrance index={index} style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, status !== 'locked' && styles.dotActive]}>
          {status === 'completed' ? (
            <Check size={12} color={theme.gradient[0]} strokeWidth={3} />
          ) : (
            <Text style={[styles.dotNum, status === 'current' && styles.dotNumCurrent]}>{stageNumber}</Text>
          )}
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.cardWrap}>
        {status === 'current' ? <GlowBorder radius={theme.radius.md}>{card}</GlowBorder> : card}
        {!isLast ? <View style={styles.spacer} /> : null}
      </View>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.md },
  rail: { width: 24, alignItems: 'center' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.glass.fillStrong,
    borderWidth: 2,
    borderColor: theme.glass.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dotActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  dotNum: { fontFamily: theme.fonts.bodyBold, fontSize: 11, color: theme.colors.textSecondary },
  dotNumCurrent: { color: theme.gradient[0] },
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
  pressable: { padding: theme.spacing.md, gap: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  stageTitle: { flex: 1, fontFamily: theme.fonts.bodySemibold, fontSize: 15, color: theme.colors.textPrimary },
  preview: { fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 19, color: theme.colors.textSecondary },
  currentPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent },
  currentPillText: { fontFamily: theme.fonts.bodyBold, fontSize: 10, letterSpacing: 0.5, color: theme.gradient[0] },
  lockPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
});
