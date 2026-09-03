import { client } from '../client';
import type { components } from '../generated/schema';

export type MoodValue = components['schemas']['MoodEnum'];
export type MoodCheckIn = components['schemas']['MoodCheckIn'];

/** Returns null when nothing has been submitted yet today (backend 404s in that case). */
export async function getTodayMood() {
  const { data, response } = await client.GET('/api/v1/mood/today/');
  if (response.status === 404) return null;
  if (!data) throw new Error('Failed to load today’s mood check-in');
  return data;
}

export async function submitTodayMood(input: { mood: MoodValue; note?: string }) {
  // MoodCheckIn's schema marks date/created_at readonly but not optional, the
  // same request/response-conflation artifact as Register and TokenObtainPair
  // (see auth.ts) — the request body genuinely has neither field.
  const { data, error } = await client.POST('/api/v1/mood/today/', {
    body: input as { mood: MoodValue; note?: string; date: string; created_at: string },
  });
  if (error) throw error;
  return data;
}

export async function listMoodHistory(page?: number) {
  const { data, error } = await client.GET('/api/v1/mood/history/', { params: { query: { page } } });
  if (error) throw error;
  return data;
}
