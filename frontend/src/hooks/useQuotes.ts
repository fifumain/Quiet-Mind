import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as quotesApi from '../api/endpoints/quotes';
import type { ListFilters } from '../api/endpoints/quotes';
import { useResourceDetail } from './useResourceDetail';
import { useResourceList } from './useResourceList';

const FAVORITE_QUOTE_IDS_KEY = ['favorites', 'quotes', 'ids'] as const;
const FAVORITE_QUOTE_LIST_KEY = ['favorites', 'quotes', 'list'] as const;

export function useQuotes(filters: Omit<ListFilters, 'page'>, options?: { enabled?: boolean }) {
  return useResourceList(['quotes', 'list'], quotesApi.listQuotes, filters, options);
}

export function useQuote(id: number) {
  return useResourceDetail(['quotes', 'detail'], quotesApi.getQuote, id);
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'list'],
    queryFn: () => quotesApi.listCategories(),
    // Admin-curated taxonomy — it does not change within a session.
    staleTime: Infinity,
  });
}

export function useQuoteOfTheDay() {
  return useQuery({
    queryKey: ['quoteOfTheDay', 'current'],
    queryFn: quotesApi.getQuoteOfTheDay,
  });
}

export function useQuoteOfTheDayHistory() {
  return useResourceList(['quoteOfTheDay', 'history'], quotesApi.listQuoteOfTheDayHistory, {});
}

export function useFavoriteQuoteIds() {
  return useQuery({
    queryKey: FAVORITE_QUOTE_IDS_KEY,
    queryFn: quotesApi.listFavoriteQuoteIds,
    staleTime: 60_000,
  });
}

export function useFavoriteQuotes(options?: { enabled?: boolean }) {
  return useResourceList(FAVORITE_QUOTE_LIST_KEY, quotesApi.listFavoriteQuotes, {}, options);
}

export function useToggleFavoriteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFavorited }: { id: number; isFavorited: boolean }) =>
      isFavorited ? quotesApi.unfavoriteQuote(id) : quotesApi.favoriteQuote(id),
    onMutate: async ({ id, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_QUOTE_IDS_KEY });
      const previous = queryClient.getQueryData<{ quote_ids: number[] }>(FAVORITE_QUOTE_IDS_KEY);
      queryClient.setQueryData<{ quote_ids: number[] }>(FAVORITE_QUOTE_IDS_KEY, (current) => ({
        quote_ids: isFavorited
          ? (current?.quote_ids ?? []).filter((x) => x !== id)
          : [...(current?.quote_ids ?? []), id],
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(FAVORITE_QUOTE_IDS_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITE_QUOTE_LIST_KEY });
    },
  });
}
