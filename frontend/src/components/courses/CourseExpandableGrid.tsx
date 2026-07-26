import { useState } from 'react';
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import type { components } from '../../api/generated/schema';
import type { CourseProgress } from '../../hooks/useCourses';
import { theme } from '../../theme/theme';
import { CourseCard } from './CourseCard';
import { CourseDetailPanel } from './CourseDetailPanel';

type CourseList = components['schemas']['CourseList'];

export interface CourseExpandableGridProps {
  courses: CourseList[];
  progressById: Map<number, CourseProgress>;
  onOpenCourse: (slug: string) => void;
}

// Native: tapping a card opens a spring-zoomed modal (no shared-element FLIP —
// that's the web-only enhancement in CourseExpandableGrid.web.tsx).
export function CourseExpandableGrid({ courses, progressById, onOpenCourse }: CourseExpandableGridProps) {
  const [active, setActive] = useState<CourseList | null>(null);
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;
  const cellWidth = columns === 2 ? '48%' : '100%';

  return (
    <View style={styles.grid}>
      {courses.map((c) => (
        <View key={c.id} style={{ width: cellWidth }}>
          <CourseCard course={c} progress={progressById.get(c.id)} onPress={() => setActive(c)} />
        </View>
      ))}

      <Modal visible={!!active} transparent animationType="fade" onRequestClose={() => setActive(null)}>
        <Animated.View entering={FadeIn.duration(320)} style={styles.backdrop}>
          {active ? (
            <Animated.View entering={ZoomIn.springify().damping(22).stiffness(90)} style={styles.modal}>
              <CourseDetailPanel
                course={active}
                progress={progressById.get(active.id)}
                onClose={() => setActive(null)}
                onOpen={() => {
                  const slug = active.slug;
                  setActive(null);
                  onOpenCourse(slug);
                }}
              />
            </Animated.View>
          ) : null}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, alignItems: 'stretch' },
  backdrop: { flex: 1, backgroundColor: 'rgba(6,14,10,0.6)', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md },
  modal: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '86%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,45,34,0.96)',
    borderWidth: 1,
    borderColor: theme.glass.borderStrong,
  },
});
