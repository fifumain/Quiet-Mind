import { client } from '../client';
import type { SendMessageResponse } from '../overrides/chat';

export async function getSession() {
  const { data, error } = await client.GET('/api/v1/chat/session/');
  if (error) throw error;
  return data;
}

export async function getMessages(page: number) {
  const { data, error } = await client.GET('/api/v1/chat/session/messages/', { params: { query: { page } } });
  if (error) throw error;
  return data;
}

export class ThrottledError extends Error {}
export class AssistantUnavailableError extends Error {}

/**
 * drf-spectacular types this endpoint's response as a bare ChatMessage — it
 * doesn't know about the hand-rolled envelope
 * apps/chat/views.py:ChatMessageListCreateView.create() actually returns.
 * `data` is cast to the real shape below; the request still goes through
 * `client` so it gets the auth/401-refresh middleware like everything else.
 */
export async function sendMessage(content: string): Promise<SendMessageResponse> {
  // ChatMessage's schema marks id/role/created_at readonly but not optional,
  // the same request/response-conflation artifact as Register and TokenObtainPair.
  const { data, error, response } = await client.POST('/api/v1/chat/session/messages/', {
    body: { content } as { content: string; id: number; role: 'user' | 'assistant'; created_at: string },
  });

  if (response.status === 429) throw new ThrottledError();
  if (response.status === 503) {
    const body = (error as unknown as { detail?: string }) ?? {};
    throw new AssistantUnavailableError(body.detail ?? 'Assistant is unavailable right now.');
  }
  if (!response.ok || !data) throw new Error(`Failed to send message (${response.status})`);

  return data as unknown as SendMessageResponse;
}

export async function resetSession() {
  const { error } = await client.DELETE('/api/v1/chat/session/reset/');
  if (error) throw error;
}
