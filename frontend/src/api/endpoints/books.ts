import { client } from '../client';
import type { ListFilters } from './quotes';

export async function listBooks(filters: ListFilters) {
  const { data, error } = await client.GET('/api/v1/books/', { params: { query: filters } });
  if (error) throw error;
  return data;
}

export async function getBook(id: number) {
  const { data, error } = await client.GET('/api/v1/books/{id}/', { params: { path: { id } } });
  if (error) throw error;
  return data;
}

/** Returns null when nothing has been set yet (backend 404s in that case). */
export async function getFeaturedBook() {
  const { data, response } = await client.GET('/api/v1/featured-books/current/');
  if (response.status === 404) return null;
  if (!data) throw new Error('Failed to load featured book');
  return data;
}
