import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../api/endpoints/chat';
import type { ChatMessage } from '../api/overrides/chat';

const MESSAGES_KEY = ['chat', 'messages'] as const;

export function useChatSession() {
  return useQuery({
    queryKey: ['chat', 'session'],
    queryFn: chatApi.getSession,
  });
}

/**
 * Fetches every page forward (oldest-first, matching the API) until there's
 * no next page, then flattens into one chronological list. Simpler than an
 * inverted "load earlier" list, which would fight the API's oldest-first
 * pagination — fine for MVP-sized histories, revisit if that ever changes.
 */
export function useChatMessages() {
  return useQuery({
    queryKey: MESSAGES_KEY,
    queryFn: async () => {
      const messages: ChatMessage[] = [];
      let page = 1;
      let next: string | null | undefined = 'first-page';
      while (next) {
        const result = await chatApi.getMessages(page);
        messages.push(...(result?.results ?? []));
        next = result?.next;
        page += 1;
      }
      return messages;
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendMessage,
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_KEY });
      const previous = queryClient.getQueryData<ChatMessage[]>(MESSAGES_KEY) ?? [];

      const pendingMessage: ChatMessage = {
        id: -Date.now(),
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, [...previous, pendingMessage]);

      return { previous, pendingId: pendingMessage.id };
    },
    onSuccess: (result, _content, context) => {
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, (current) => {
        const withoutPending = (current ?? []).filter((m) => m.id !== context?.pendingId);
        return [...withoutPending, result.user_message, result.assistant_message];
      });
    },
    onError: (_err, _content, context) => {
      if (context) queryClient.setQueryData(MESSAGES_KEY, context.previous);
    },
  });
}

export function useResetChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.resetSession,
    onSuccess: () => {
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, []);
    },
  });
}
