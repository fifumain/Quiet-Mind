import { client } from '../client';
import type { ListFilters } from './quotes';

export async function listCourses(filters: ListFilters) {
  const { data, error } = await client.GET('/api/v1/courses/', { params: { query: { page: filters.page } } });
  if (error) throw error;
  return data;
}

export async function getCourse(slug: string) {
  const { data, error } = await client.GET('/api/v1/courses/{slug}/', { params: { path: { slug } } });
  if (error) throw error;
  return data;
}

export async function enrollCourse(slug: string) {
  const { data, error } = await client.POST('/api/v1/courses/{slug}/enroll/', { params: { path: { slug } } });
  if (error) throw error;
  return data;
}

export async function completeCourseStage(slug: string, stageNumber: number) {
  const { data, error } = await client.POST('/api/v1/courses/{slug}/stages/{stage_number}/complete/', {
    params: { path: { slug, stage_number: stageNumber } },
  });
  if (error) throw error;
  return data;
}

export async function listMyCourseProgress(filters: ListFilters) {
  const { data, error } = await client.GET('/api/v1/courses/my-progress/', { params: { query: { page: filters.page } } });
  if (error) throw error;
  return data;
}
