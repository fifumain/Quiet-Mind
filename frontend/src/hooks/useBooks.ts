import { useQuery } from '@tanstack/react-query';
import * as booksApi from '../api/endpoints/books';
import type { ListFilters } from '../api/endpoints/quotes';
import { useResourceDetail } from './useResourceDetail';
import { useResourceList } from './useResourceList';

export function useBooks(filters: Omit<ListFilters, 'page'>) {
  return useResourceList(['books', 'list'], booksApi.listBooks, filters);
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
