import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as coursesApi from '../api/endpoints/courses';
import { useResourceList } from './useResourceList';

const MY_PROGRESS_KEY = ['courses', 'myProgress'] as const;

export type CourseState = 'new' | 'progress' | 'done';

export interface CourseProgress {
  state: CourseState;
  completed: number;
  currentStage: number;
  completedAt: string | null;
}

export function useCourses() {
  return useResourceList(['courses', 'list'], coursesApi.listCourses, {});
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['courses', 'detail', slug],
    queryFn: () => coursesApi.getCourse(slug),
    enabled: !!slug,
  });
}

export function useMyCourseProgress() {
  return useResourceList(MY_PROGRESS_KEY, coursesApi.listMyCourseProgress, {});
}

/** Flattens my-progress into a courseId → progress map for the grid/cards/runner. */
export function useCourseProgressMap() {
  const query = useMyCourseProgress();
  const map = new Map<number, CourseProgress>();
  const enrollments = query.data?.pages.flatMap((page) => page?.results ?? []) ?? [];
  for (const e of enrollments) {
    if (!e.course) continue;
    const completed = e.completed_stage_numbers?.length ?? 0;
    const currentStage = e.current_stage ?? 1;
    const state: CourseState = e.completed_at
      ? 'done'
      : completed > 0 || currentStage > 1
        ? 'progress'
        : 'new';
    map.set(e.course.id, { state, completed, currentStage, completedAt: e.completed_at ?? null });
  }
  return { map, query };
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.enrollCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_PROGRESS_KEY }),
  });
}

export function useCompleteCourseStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, stageNumber }: { slug: string; stageNumber: number }) =>
      coursesApi.completeCourseStage(slug, stageNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_PROGRESS_KEY });
      queryClient.invalidateQueries({ queryKey: ['courses', 'list'] });
    },
  });
}
