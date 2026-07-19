import { useQuery } from '@tanstack/react-query';

export function useResourceDetail<T>(queryKey: readonly unknown[], fetchOne: (id: number) => Promise<T>, id: number) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: () => fetchOne(id),
  });
}
