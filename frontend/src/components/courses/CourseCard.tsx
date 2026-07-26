import { Image } from 'expo-image';
import { BookOpen, Check, Users } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { components } from '../../api/generated/schema';
import type { CourseProgress } from '../../hooks/useCourses';
import { glassBlur, theme } from '../../theme/theme';

type CourseList = components['schemas']['CourseList'];

interface CourseCardProps {
  course: CourseList;
  progress?: CourseProgress;
  onPress: () => void;
}

// Distinct cover tints per course so the placeholder (and the frame while a
// real photo loads) never reads as an empty grey box.
const COVER_TINTS = ['#1f6d63', '#7a3350', '#3f7a52', '#9a5a22', '#453a86', '#8a6f1f'];

export const CourseCard = forwardRef<View, CourseCardProps>(function CourseCard(
  { course, progress, onPress },
  ref,
) {
  const [hovered, setHovered] = useState(false);
  const tint = COVER_TINTS[course.id % COVER_TINTS.length];
  const state = progress?.state ?? 'new';

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.card,
        theme.shadow.card as object,
        hovered && (theme.shadow.cardHover as object),
        hovered && styles.cardHover,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.cover, { backgroundColor: tint }]}>
        {course.cover_image ? (
          <Image source={course.cover_image} style={StyleSheet.absoluteFill} contentFit="cover" transition={220} />
        ) : (
          <View style={styles.coverFallback}>
            <BookOpen size={34} color="rgba(245,246,240,0.5)" strokeWidth={1.6} />
          </View>
        )}
        <View style={[styles.pop, glassBlur(6)]}>
          <Users size={12} color={theme.colors.textPrimary} strokeWidth={2.2} />
          <Text style={styles.popText}>{course.completions_count}</Text>
        </View>
        <View style={styles.cats}>
          {course.categories.slice(0, 2).map((c) => (
            <View key={c.id} style={[styles.chip, glassBlur(6)]}>
              <Text style={styles.chipText}>{c.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.teaser} numberOfLines={2}>
          {course.teaser}
        </Text>
        <View style={styles.footer}>
          {state === 'new' ? (
            <>
              <Text style={styles.stagesN}>{course.stage_count} этапов</Text>
              <View style={styles.ctaPill}>
                <Text style={styles.ctaPillText}>Начать</Text>
              </View>
            </>
          ) : state === 'progress' ? (
            <>
              <View style={styles.bar}>
                <View
                  style={[styles.barFill, { width: `${Math.round(((progress?.completed ?? 0) / course.stage_count) * 100)}%` }]}
                />
              </View>
              <Text style={styles.ghost}>
                {progress?.completed}/{course.stage_count} · продолжить
              </Text>
            </>
          ) : (
            <>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: '100%' }]} />
              </View>
              <View style={styles.ghostRow}>
                <Check size={13} color={theme.colors.accent} strokeWidth={3} />
                <Text style={styles.ghost}>Пройдено</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: theme.glass.fill,
  },
  cardHover: { borderColor: theme.glass.borderStrong, transform: [{ translateY: -4 }] },
  cardPressed: { transform: [{ scale: 0.985 }] },
  cover: { position: 'relative', width: '100%', aspectRatio: 16 / 10 },
  coverFallback: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  pop: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(14,31,22,0.5)',
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  popText: { color: theme.colors.textPrimary, fontSize: 11, fontFamily: theme.fonts.bodySemibold },
  cats: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(14,31,22,0.42)',
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  chipText: { color: theme.colors.textPrimary, fontSize: 11, fontFamily: theme.fonts.bodyMedium },
  // flex:1 lets the body fill the (row-stretched) card height so the footer,
  // pinned with marginTop:'auto', lines up across cards regardless of whether
  // the teaser wraps to one or two lines.
  body: { flex: 1, padding: 16, paddingTop: 15, gap: 7 },
  title: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.textPrimary, lineHeight: 25 },
  teaser: { fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 20, color: theme.colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto', paddingTop: 12 },
  stagesN: { fontFamily: theme.fonts.bodyMedium, fontSize: 12, color: theme.colors.textMuted },
  bar: { flex: 1, height: 6, borderRadius: theme.radius.pill, backgroundColor: theme.glass.fillSubtle, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.colors.accent, borderRadius: theme.radius.pill },
  ghost: { fontFamily: theme.fonts.bodySemibold, fontSize: 12, color: theme.colors.accent },
  ghostRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ctaPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent },
  ctaPillText: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: theme.gradient[0] },
});
