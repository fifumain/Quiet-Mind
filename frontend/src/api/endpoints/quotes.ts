import { client } from '../client';

export interface ListFilters {
  category?: string;
  author?: number;
  search?: string;
  page?: number;
}

export async function listQuotes(filters: ListFilters) {
  const { data, error } = await client.GET('/api/v1/quotes/', { params: { query: filters } });
  if (error) throw error;
  return data;
}

export async function getQuote(id: number) {
  const { data, error } = await client.GET('/api/v1/quotes/{id}/', { params: { path: { id } } });
  if (error) throw error;
  return data;
}

export async function listCategories(page?: number) {
  const { data, error } = await client.GET('/api/v1/categories/', { params: { query: { page } } });
  if (error) throw error;
  return data;
}

/** Returns null when nothing has been set yet (backend 404s in that case). */
export async function getQuoteOfTheDay() {
  const { data, response } = await client.GET('/api/v1/quote-of-the-day/current/');
  if (response.status === 404) return null;
  if (!data) throw new Error('Failed to load quote of the day');
  return data;
}
