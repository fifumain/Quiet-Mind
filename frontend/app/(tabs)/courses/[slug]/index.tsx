import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Check from 'lucide-react-native/icons/check';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../src/components/common/AppText';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../../src/components/common/ScreenContainer';
import { SpecularButton } from '../../../../src/components/common/SpecularButton';
import { CourseStageEntry } from '../../../../src/components/courses/CourseStageEntry';
import { useCourse, useCourseProgressMap, useEnrollCourse } from '../../../../src/hooks/useCourses';
import { theme } from '../../../../src/theme/theme';

const COVER_TINTS = ['#1f6d63', '#7a3350', '#3f7a52', '#9a5a22', '#453a86', '#8a6f1f'];

export default function CourseRunnerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const courseQuery = useCourse(slug);
  const { map: progressById } = useCourseProgressMap();
  const enroll = useEnrollCourse();

  if (courseQuery.isLoading) {
    return (
      <ScreenContainer>
        <BackLink label="Courses" onPress={() => router.navigate('/courses')} />
        <LoadingSpinner />
      </ScreenContainer>
    );
  }
  if (!courseQuery.data) {
    return (
      <ScreenContainer>
        <BackLink label="Courses" onPress={() => router.navigate('/courses')} />
        <EmptyState message="Course not found." />
      </ScreenContainer>
    );
  }

  const course = courseQuery.data;
  const stages = course.stages ?? [];
  const total = stages.length;
  const progress = progressById.get(course.id);
  const currentStage = progress?.currentStage ?? 1;
  const isDone = !!progress?.completedAt;
  const completedCount = progress ? Math.min(currentStage - 1, total) : 0;
  const tint = COVER_TINTS[course.id % COVER_TINTS.length];

  const openStage = (stageNumber: number) => router.navigate(`/courses/${slug}/stage/${stageNumber}`);

  const cta = () => {
    if (!progress) {
      return (
        <SpecularButton
          onPress={() => enroll.mutate(slug, { onSuccess: () => openStage(1) })}
          radius={theme.radius.pill}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Start course</Text>
          <ArrowRight size={18} color={theme.gradient[0]} strokeWidth={2.4} />
        </SpecularButton>
      );
    }
    if (isDone) {
      return (
        <SpecularButton disabled radius={theme.radius.pill} style={styles.primaryBtn}>
          <Check size={18} color={theme.gradient[0]} strokeWidth={3} />
          <Text style={styles.primaryBtnText}>Course completed</Text>
        </SpecularButton>
      );
    }
    return (
      <SpecularButton onPress={() => openStage(currentStage)} radius={theme.radius.pill} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Continue: stage {currentStage}</Text>
        <ArrowRight size={18} color={theme.gradient[0]} strokeWidth={2.4} />
      </SpecularButton>
    );
  };

  return (
    <ScreenContainer>
      <BackLink label="Courses" onPress={() => router.navigate('/courses')} />

      <View style={[styles.cover, { backgroundColor: tint }]}>
        {course.cover_image ? (
          <Image source={course.cover_image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : null}
        <View style={styles.coverVeil} />
        <View style={styles.coverHead}>
          <Text style={styles.title}>{course.title}</Text>
          <View style={styles.progRow}>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${total ? Math.round((completedCount / total) * 100) : 0}%` }]} />
            </View>
            <Text style={styles.progText}>
              {completedCount} / {total} stages
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.ctaWrap}>{cta()}</View>

      <View style={styles.timeline}>
        {stages.map((s, i) => {
          const status = s.stage_number < currentStage ? 'completed' : s.stage_number === currentStage ? 'current' : 'locked';
          return (
            <CourseStageEntry
              key={s.stage_number}
              index={i}
              isLast={i === stages.length - 1}
              status={status}
              stageNumber={s.stage_number}
              title={s.title}
              preview={s.reflection_prompt || s.body}
              onPress={() => openStage(s.stage_number)}
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}

function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.back} hitSlop={8}>
      <ChevronLeft size={18} color={theme.colors.accent} strokeWidth={2.4} />
      <Text style={styles.backText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: theme.spacing.sm },
  backText: { fontFamily: theme.fonts.bodySemibold, fontSize: theme.fontSize.sm, color: theme.colors.accent },
  cover: { height: 180, borderRadius: theme.radius.lg, overflow: 'hidden', position: 'relative' },
  coverVeil: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,31,22,0.4)' },
  coverHead: { position: 'absolute', left: 20, right: 20, bottom: 16 },
  title: { fontFamily: theme.fonts.display, fontSize: 25, color: theme.colors.textPrimary },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  bar: { flex: 1, maxWidth: 240, height: 6, borderRadius: theme.radius.pill, backgroundColor: theme.glass.fillSubtle, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.colors.accent, borderRadius: theme.radius.pill },
  progText: { fontFamily: theme.fonts.bodyMedium, fontSize: 12, color: theme.colors.textSecondary },
  ctaWrap: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg, alignItems: 'flex-start' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  primaryBtnText: { fontFamily: theme.fonts.bodyBold, fontSize: 15, color: theme.gradient[0] },
  timeline: { marginTop: theme.spacing.xs },
});
