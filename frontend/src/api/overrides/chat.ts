import type { components } from '../generated/schema';

export type ChatMessage = components['schemas']['ChatMessage'];

// drf-spectacular describes POST /api/v1/chat/session/messages/ as returning a
// bare ChatMessage, but apps/chat/views.py:ChatMessageListCreateView.create()
// actually returns this hand-rolled envelope. Keep this in sync by hand if that
// view's response shape ever changes.
export interface SendMessageResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}
