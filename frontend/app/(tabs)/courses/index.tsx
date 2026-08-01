import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../src/components/common/AppText';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { CourseExpandableGrid } from '../../../src/components/courses/CourseExpandableGrid';
import { useCourseProgressMap, useCourses } from '../../../src/hooks/useCourses';
import { glassBlur, theme } from '../../../src/theme/theme';

type SortMode = 'rec' | 'pop';
type ProgressFilter = 'all' | 'new' | 'progress' | 'done';

export default function CoursesScreen() {
  const router = useRouter();
  const coursesQuery = useCourses();
  const { map: progressById } = useCourseProgressMap();

  const [sort, setSort] = useState<SortMode>('rec');
  const [progress, setProgress] = useState<ProgressFilter>('all');
  const [hideDone, setHideDone] = useState(true);

  // Memoised so `visible` below can actually hit its cache — a fresh flatMap()
  // every render would change identity and defeat it.
  const coursesData = coursesQuery.data;
  const courses = useMemo(
    () => coursesData?.pages.flatMap((page) => page?.results ?? []) ?? [],
    [coursesData],
  );

  const visible = useMemo(() => {
    const stateOf = (id: number) => progressById.get(id)?.state ?? 'new';
    let list = courses.filter((c) => {
      if (progress !== 'all') return stateOf(c.id) === progress;
      if (hideDone) return stateOf(c.id) !== 'done';
      return true;
    });
    if (sort === 'pop') list = [...list].sort((a, b) => b.completions_count - a.completions_count);
    return list;
  }, [courses, progressById, sort, progress, hideDone]);

  return (
    <ScreenContainer title="Courses">
      <Text style={styles.lede}>
        Short psychology courses. Tap a card to open its description and syllabus; the button inside
        takes you into the course itself.
      </Text>

      <View style={styles.toolbar}>
        <View style={[styles.seg, glassBlur()]}>
          <SegButton label="Recommended" active={sort === 'rec'} onPress={() => setSort('rec')} />
          <SegButton label="Popular" active={sort === 'pop'} onPress={() => setSort('pop')} />
        </View>
        <Pressable
          onPress={() => setHideDone((v) => !v)}
          style={styles.switchRow}
          accessibilityRole="switch"
          accessibilityState={{ checked: hideDone }}
        >
          <View style={[styles.track, hideDone && styles.trackOn]}>
            <View style={[styles.knob, hideDone && styles.knobOn]} />
          </View>
          <Text style={styles.switchLabel}>Hide completed</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {(
          [
            ['all', 'All'],
            ['new', 'Not started'],
            ['progress', 'In progress'],
            ['done', 'Completed'],
          ] as [ProgressFilter, string][]
        ).map(([value, label]) => (
          <Chip key={value} label={label} active={progress === value} onPress={() => setProgress(value)} />
        ))}
      </View>

      {coursesQuery.isLoading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState message="Nothing found — try another filter." />
      ) : (
        <View style={styles.gridWrap}>
          <CourseExpandableGrid
            courses={visible}
            progressById={progressById}
            onOpenCourse={(slug) => router.navigate(`/courses/${slug}`)}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

function SegButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segButton, active && styles.segButtonActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lede: { fontFamily: theme.fonts.body, fontSize: theme.fontSize.sm, lineHeight: 21, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  seg: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
  },
  segButton: { paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.radius.sm },
  segButtonActive: { backgroundColor: theme.glass.selected },
  segText: { fontFamily: theme.fonts.bodySemibold, fontSize: theme.fontSize.sm, color: theme.colors.textMuted },
  segTextActive: { color: theme.colors.textPrimary },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginLeft: 'auto' },
  track: { width: 40, height: 22, borderRadius: theme.radius.pill, backgroundColor: theme.glass.fillSubtle, borderWidth: 1, borderColor: theme.glass.border, justifyContent: 'center', paddingHorizontal: 2 },
  trackOn: { backgroundColor: 'rgba(227,217,160,0.32)', borderColor: theme.colors.accent },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.textMuted },
  knobOn: { backgroundColor: theme.colors.accent, transform: [{ translateX: 18 }] },
  switchLabel: { fontFamily: theme.fonts.bodySemibold, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.glass.border },
  chipActive: { backgroundColor: theme.glass.selected, borderColor: theme.glass.selectedBorder },
  chipText: { fontFamily: theme.fonts.bodySemibold, fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  chipTextActive: { color: theme.colors.textPrimary },
  gridWrap: { width: '100%' },
});
