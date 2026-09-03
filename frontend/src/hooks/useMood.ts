import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as moodApi from '../api/endpoints/mood';
import type { MoodCheckIn, MoodValue } from '../api/endpoints/mood';
import { useResourceList } from './useResourceList';

const TODAY_KEY = ['mood', 'today'] as const;
const HISTORY_KEY = ['mood', 'history'] as const;

export function useTodayMood() {
  return useQuery({
    queryKey: TODAY_KEY,
    queryFn: moodApi.getTodayMood,
  });
}

export function useMoodHistory() {
  return useResourceList(HISTORY_KEY, (f) => moodApi.listMoodHistory(f.page), {});
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function useSubmitMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { mood: MoodValue; note?: string }) => moodApi.submitTodayMood(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TODAY_KEY });
      const previous = queryClient.getQueryData<MoodCheckIn | null>(TODAY_KEY);
      queryClient.setQueryData<MoodCheckIn>(TODAY_KEY, {
        date: todayIso(),
        mood: input.mood,
        note: input.note ?? '',
        created_at: new Date().toISOString(),
      });
      return { previous };
    },
    // The server response carries the real created_at (and, on an edit within
    // the same day, the original creation time rather than the mutation's
    // optimistic guess) — replace the optimistic entry with it once it lands.
    onSuccess: (result) => {
      queryClient.setQueryData<MoodCheckIn>(TODAY_KEY, result);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(TODAY_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
}
