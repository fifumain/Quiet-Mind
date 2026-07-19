import { useInfiniteQuery } from '@tanstack/react-query';
import type { ListFilters } from '../api/endpoints/quotes';

interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export function useResourceList<T>(
  queryKey: readonly unknown[],
  fetchPage: (filters: ListFilters) => Promise<PaginatedResponse<T> | undefined>,
  filters: Omit<ListFilters, 'page'>,
) {
  return useInfiniteQuery({
    queryKey: [...queryKey, filters],
    queryFn: ({ pageParam }) => fetchPage({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage?.next ? allPages.length + 1 : undefined),
  });
}
