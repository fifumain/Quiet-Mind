import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as booksApi from '../api/endpoints/books';
import type { ListFilters } from '../api/endpoints/quotes';
import { useResourceDetail } from './useResourceDetail';
import { useResourceList } from './useResourceList';

const FAVORITE_BOOK_IDS_KEY = ['favorites', 'books', 'ids'] as const;
const FAVORITE_BOOK_LIST_KEY = ['favorites', 'books', 'list'] as const;

export function useBooks(filters: Omit<ListFilters, 'page'>, options?: { enabled?: boolean }) {
  return useResourceList(['books', 'list'], booksApi.listBooks, filters, options);
}

export function useBook(id: number) {
  return useResourceDetail(['books', 'detail'], booksApi.getBook, id);
}

export function useFeaturedBook() {
  return useQuery({
    queryKey: ['featuredBook', 'current'],
    queryFn: booksApi.getFeaturedBook,
  });
}

export function useFeaturedBookHistory() {
  return useResourceList(['featuredBook', 'history'], booksApi.listFeaturedBookHistory, {});
}

export function useFavoriteBookIds() {
  return useQuery({
    queryKey: FAVORITE_BOOK_IDS_KEY,
    queryFn: booksApi.listFavoriteBookIds,
    staleTime: 60_000,
  });
}

export function useFavoriteBooks(options?: { enabled?: boolean }) {
  return useResourceList(FAVORITE_BOOK_LIST_KEY, booksApi.listFavoriteBooks, {}, options);
}

export function useToggleFavoriteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFavorited }: { id: number; isFavorited: boolean }) =>
      isFavorited ? booksApi.unfavoriteBook(id) : booksApi.favoriteBook(id),
    onMutate: async ({ id, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_BOOK_IDS_KEY });
      const previous = queryClient.getQueryData<{ book_ids: number[] }>(FAVORITE_BOOK_IDS_KEY);
      queryClient.setQueryData<{ book_ids: number[] }>(FAVORITE_BOOK_IDS_KEY, (current) => ({
        book_ids: isFavorited
          ? (current?.book_ids ?? []).filter((x) => x !== id)
          : [...(current?.book_ids ?? []), id],
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(FAVORITE_BOOK_IDS_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITE_BOOK_LIST_KEY });
    },
  });
}
