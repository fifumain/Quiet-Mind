import { useLocalSearchParams, useRouter } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../../src/components/common/AppText';
import { EmptyState } from '../../../../../src/components/common/EmptyState';
import { GlassCard } from '../../../../../src/components/common/GlassCard';
import { LoadingSpinner } from '../../../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../../../src/components/common/ScreenContainer';
import { SpecularButton } from '../../../../../src/components/common/SpecularButton';
import { useCourse, useCourseProgressMap, useCompleteCourseStage } from '../../../../../src/hooks/useCourses';
import { theme } from '../../../../../src/theme/theme';

export default function CourseStageScreen() {
  const { slug, stageNumber } = useLocalSearchParams<{ slug: string; stageNumber: string }>();
  const router = useRouter();
  const stageNo = Number(stageNumber);
  const courseQuery = useCourse(slug);
  const { map: progressById } = useCourseProgressMap();
  const complete = useCompleteCourseStage();

  const backToCourse = () => router.navigate(`/courses/${slug}`);

  if (courseQuery.isLoading) {
    return (
      <ScreenContainer>
        <BackLink onPress={backToCourse} />
        <LoadingSpinner />
      </ScreenContainer>
    );
  }
  const course = courseQuery.data;
  const stage = course?.stages?.find((s) => s.stage_number === stageNo);
  if (!course || !stage) {
    return (
      <ScreenContainer>
        <BackLink onPress={backToCourse} />
        <EmptyState message="Stage not found." />
      </ScreenContainer>
    );
  }

  const total = course.stages?.length ?? 0;
  const progress = progressById.get(course.id);
  const currentStage = progress?.currentStage ?? 1;
  const isCompleted = !!progress && stageNo < currentStage;
  const isCurrent = !!progress && stageNo === currentStage;
  const isLocked = !progress || stageNo > currentStage;

  const onComplete = () =>
    complete.mutate(
      { slug, stageNumber: stageNo },
      { onSuccess: () => (stageNo < total ? router.navigate(`/courses/${slug}/stage/${stageNo + 1}`) : backToCourse()) },
    );

  return (
    <ScreenContainer>
      <BackLink onPress={backToCourse} />

      <Text style={styles.eyebrow}>
        {course.title} · stage {stageNo} of {total}
      </Text>
      <Text style={styles.title}>{stage.title}</Text>
      <Text style={styles.body}>{stage.body}</Text>

      {stage.quote ? (
        <GlassCard style={styles.refCard}>
          <Text style={styles.refLabel}>Quote</Text>
          <Text style={styles.quoteText}>“{stage.quote.text}”</Text>
          <Text style={styles.quoteAuthor}>— {stage.quote.author.name}</Text>
        </GlassCard>
      ) : null}

      {stage.book ? (
        <GlassCard style={styles.refCard}>
          <Text style={styles.refLabel}>Book</Text>
          <Text style={styles.bookTitle}>{stage.book.title}</Text>
          <Text style={styles.bookAuthor}>{stage.book.author.name}</Text>
        </GlassCard>
      ) : null}

      {stage.reflection_prompt ? (
        <View style={styles.reflection}>
          <Text style={styles.refLabel}>A question to sit with</Text>
          <Text style={styles.reflectionText}>{stage.reflection_prompt}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {isCompleted ? (
          <View style={styles.donePill}>
            <Check size={16} color={theme.colors.accent} strokeWidth={3} />
            <Text style={styles.donePillText}>Stage completed</Text>
          </View>
        ) : (
          <>
            <SpecularButton
              onPress={onComplete}
              disabled={isLocked || complete.isPending}
              radius={theme.radius.pill}
              style={[styles.primaryBtn, (isLocked || complete.isPending) && styles.primaryBtnDisabled]}
            >
              <Text style={styles.primaryBtnText}>
                {complete.isPending ? 'Saving…' : 'Mark as done'}
              </Text>
            </SpecularButton>
            {isLocked ? (
              <Text style={styles.hint}>
                {progress ? 'Finish the previous stage first.' : 'Start the course to mark stages complete.'}
              </Text>
            ) : isCurrent ? (
              <Text style={styles.hint}>Take your time — mark it done when you are ready.</Text>
            ) : null}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.back} hitSlop={8}>
      <ChevronLeft size={18} color={theme.colors.accent} strokeWidth={2.4} />
      <Text style={styles.backText}>Back to course</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: theme.spacing.sm },
  backText: { fontFamily: theme.fonts.bodySemibold, fontSize: theme.fontSize.sm, color: theme.colors.accent },
  eyebrow: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  title: { fontFamily: theme.fonts.display, fontSize: 27, color: theme.colors.textPrimary, lineHeight: 33 },
  body: { fontFamily: theme.fonts.body, fontSize: 16, lineHeight: 26, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  refCard: { marginTop: theme.spacing.lg, gap: 4 },
  refLabel: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  quoteText: { fontFamily: theme.fonts.displayMedium, fontSize: 18, lineHeight: 27, color: theme.colors.textPrimary },
  quoteAuthor: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginTop: 6 },
  bookTitle: { fontFamily: theme.fonts.bodyBold, fontSize: 16, color: theme.colors.textPrimary },
  bookAuthor: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  reflection: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    backgroundColor: theme.glass.fillSubtle,
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
  },
  reflectionText: { fontFamily: theme.fonts.displayMedium, fontSize: 18, lineHeight: 28, color: theme.colors.textPrimary },
  actions: { marginTop: theme.spacing.xl, gap: 10, alignItems: 'flex-start' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: theme.fonts.bodyBold, fontSize: 15, color: theme.gradient[0] },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: theme.glass.fillSubtle,
  },
  donePillText: { fontFamily: theme.fonts.bodySemibold, fontSize: 14, color: theme.colors.accent },
  hint: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted },
});
