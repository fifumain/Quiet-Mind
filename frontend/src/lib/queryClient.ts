import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      /**
       * Defaults matter a lot here because most of this app's data is
       * admin-curated content that changes maybe once a day.
       *
       * With the library defaults (`staleTime: 0`, `refetchOnWindowFocus: true`)
       * every screen refetched on each mount, and alt-tabbing back into the app
       * refetched *every* mounted query — including every loaded page of the
       * infinite lists. A minute of freshness removes that churn without anyone
       * noticing staleness.
       */
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});
