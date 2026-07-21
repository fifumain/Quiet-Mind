import { useQuery } from '@tanstack/react-query';
import * as quotesApi from '../api/endpoints/quotes';
import type { ListFilters } from '../api/endpoints/quotes';
import { useResourceDetail } from './useResourceDetail';
import { useResourceList } from './useResourceList';

export function useQuotes(filters: Omit<ListFilters, 'page'>) {
  return useResourceList(['quotes', 'list'], quotesApi.listQuotes, filters);
}

export function useQuote(id: number) {
  return useResourceDetail(['quotes', 'detail'], quotesApi.getQuote, id);
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'list'],
    queryFn: () => quotesApi.listCategories(),
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
