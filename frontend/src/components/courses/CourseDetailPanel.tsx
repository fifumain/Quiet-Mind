import { Image } from 'expo-image';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import X from 'lucide-react-native/icons/x';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import type { components } from '../../api/generated/schema';
import type { CourseProgress } from '../../hooks/useCourses';
import { useCourse } from '../../hooks/useCourses';
import { glassBlur, theme } from '../../theme/theme';
import { SpecularButton } from '../common/SpecularButton';

type CourseList = components['schemas']['CourseList'];

interface CourseDetailPanelProps {
  course: CourseList;
  progress?: CourseProgress;
  onClose: () => void;
  onOpen: () => void;
}

const COVER_TINTS = ['#1f6d63', '#7a3350', '#3f7a52', '#9a5a22', '#453a86', '#8a6f1f'];

export function CourseDetailPanel({ course, progress, onClose, onOpen }: CourseDetailPanelProps) {
  const detail = useCourse(course.slug);
  const tint = COVER_TINTS[course.id % COVER_TINTS.length];
  const state = progress?.state ?? 'new';
  const cta = state === 'done' ? 'Revisit course' : state === 'progress' ? 'Continue course' : 'Start course';
  const hint =
    state === 'done'
      ? 'Course completed — you can revisit any stage'
      : state === 'progress'
        ? `Continue from stage ${progress?.currentStage}`
        : 'Enrol and begin with stage 1';

  return (
    <View style={styles.panel}>
      <View style={[styles.cover, { backgroundColor: tint }]}>
        {course.cover_image ? (
          <Image source={course.cover_image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : null}
        <View style={styles.coverVeil} />
        <Pressable onPress={onClose} hitSlop={8} style={[styles.close, glassBlur(6)]} accessibilityLabel="Close">
          <X size={16} color={theme.colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cats}>
          {course.categories.map((c) => (
            <View key={c.id} style={styles.chip}>
              <Text style={styles.chipText}>{c.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.title}>{course.title}</Text>

        {detail.isLoading ? (
          <ActivityIndicator color={theme.colors.textPrimary} style={{ marginTop: theme.spacing.md }} />
        ) : (
          <>
            <Text style={styles.desc}>{detail.data?.description || course.teaser}</Text>
            <Text style={styles.sub}>
              {course.stage_count} stages · {course.completions_count} completed
            </Text>
            <View style={styles.syllabus}>
              {(detail.data?.stages ?? []).map((s) => (
                <View key={s.stage_number} style={styles.stageRow}>
                  <View style={styles.stageNum}>
                    <Text style={styles.stageNumText}>{s.stage_number}</Text>
                  </View>
                  <Text style={styles.stageTitle}>{s.title}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <SpecularButton onPress={onOpen} radius={theme.radius.pill} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>{cta}</Text>
            <ArrowRight size={18} color={theme.gradient[0]} strokeWidth={2.4} />
          </SpecularButton>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, overflow: 'hidden' },
  cover: { height: 200, position: 'relative' },
  coverVeil: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,32,24,0.28)' },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,14,10,0.5)',
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  scroll: { padding: 22, paddingTop: 20, gap: 0 },
  cats: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  chipText: { color: theme.colors.textPrimary, fontSize: 11, fontFamily: theme.fonts.bodyMedium },
  title: { fontFamily: theme.fonts.display, fontSize: 26, color: theme.colors.textPrimary, lineHeight: 31 },
  desc: { fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 24, color: theme.colors.textSecondary, marginTop: 12 },
  sub: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginTop: 22,
    marginBottom: 10,
  },
  syllabus: { gap: 8 },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: 14,
    backgroundColor: theme.glass.fillSubtle,
  },
  stageNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.glass.fillStrong,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  stageNumText: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: theme.colors.textSecondary },
  stageTitle: { flex: 1, fontFamily: theme.fonts.bodyMedium, fontSize: 14, color: theme.colors.textPrimary },
  actions: { marginTop: 22, gap: 10, alignItems: 'flex-start' },
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
  hint: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted },
});
