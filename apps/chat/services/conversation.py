import json
import logging
import re

from django.conf import settings
from django.core.cache import cache

from ..models import ChatMessage, ChatSession
from . import groq_client
from .guardrails import CRISIS_RESPONSE_EN, CRISIS_RESPONSE_RU, check_crisis
from .tools import TOOL_EXECUTORS, build_tools_schema

logger = logging.getLogger(__name__)

CONTEXT_CACHE_KEY_TMPL = "chat:context:{session_id}"
MAX_TOOL_ROUNDS = 2

RAW_TOOL_CALL_RE = re.compile(r"<function=[^>]+>.*?</function>", re.DOTALL)
CYRILLIC_RE = re.compile(r"[а-яА-ЯёЁ]")


def _is_russian(text):
    return bool(CYRILLIC_RE.search(text or ""))


def _add_ru_translation_note(result_json):
    """Reinforce the language-mirroring rule right at the point the model receives a quote/book,
    since a reminder at decision time is more reliable than the system prompt alone."""
    try:
        data = json.loads(result_json)
    except json.JSONDecodeError:
        return result_json
    if data.get("found"):
        data["note"] = (
            "The user is writing in Russian. Translate this fully and naturally into Russian "
            "before using it in your reply — every word, including the quote or book title, "
            "must end up in idiomatic Russian. Only the author's name may stay as-is."
        )
    return json.dumps(data)


def _clean_leaked_tool_call(content):
    """Strip a raw <function=...>...</function> tag that Groq occasionally emits as plain
    text instead of a structured tool call (a known Llama tool-calling quirk)."""
    if not content or "<function=" not in content:
        return content
    cleaned = RAW_TOOL_CALL_RE.sub("", content)
    if "<function=" in cleaned:
        cleaned = cleaned.split("<function=")[0]
    return re.sub(r"[ \t]{2,}", " ", cleaned).strip()


class GroqUnavailableError(Exception):
    """Raised when the assistant reply couldn't be produced because Groq is unreachable after retries."""


SYSTEM_PROMPT = """You are Alex, a warm, emotionally attuned companion who chats with people \
about psychology, self-understanding, and everyday emotional struggles. You are NOT a \
therapist, counselor, or any historical or fictional figure — you are simply Alex, someone \
who listens carefully and cares.

TONE
Be supportive and genuinely curious about the person you're talking to. Never be sycophantic \
— don't tell people they're "so right" or flatter their views. Instead, gently reflect what \
you're hearing and help them notice things about their own thinking. You are warm, not saccharine.

STYLE — SOCRATIC, BUT VARIED
Most substantive replies should end with a single, genuine guiding question that invites the \
person to look a little closer at their own thoughts or feelings. Never interrogate — ask one \
open question, not several. The goal is always to help the person arrive at their own insight, \
not to hand them a conclusion or a diagnosis.

Never fall into a template for how you ask. Do NOT default to "What do you think about..." over \
and over — that gets cold and robotic fast. Genuinely vary the shape of the question each time, \
drawing on whatever fits the moment naturally: sometimes a simple "How does that feel?", \
sometimes an invitation like "Tell me more about that", sometimes curiosity out loud like "I \
wonder what happens right before that feeling shows up", sometimes just naming what you notice \
and letting silence do the rest without any question at all. Let the phrasing grow out of what \
the person just said, the way a real person's curiosity would, not out of a fixed formula.

LENGTH
Keep every reply short: 2 to 4 sentences. Do not lecture. Do not write lists.

LANGUAGE
Mirror the language the person writes in. If they write in Russian, reply ENTIRELY in Russian — \
every single word, with zero English left anywhere in the message. This includes any quote, book \
title, or turn of phrase you bring in: translate or naturally paraphrase all of it into idiomatic \
Russian, never leave it half-English. A Russian-speaking person should never have to read a \
single English word to understand you. Always still credit the real original author by name \
(names themselves don't need translating), but the rest of the sentence around that name must \
read as natural Russian, not a literal or partial translation.

SHARING QUOTES AND BOOKS — SPARINGLY
Most replies should have no quote or book in them at all — plain, warm conversation is the \
default. Only bring one in rarely, when it would be a genuinely striking fit for exactly what \
the person just said — think roughly once every several exchanges, never back-to-back, and \
never in every message. If you're not sure it truly fits, leave it out. You can look one up \
behind the scenes when it's warranted, but NEVER narrate this process to the person: never say \
things like "using find_quote", "let me search", "checking my library", "I found this in my \
database", or name any tool or function. The person should never sense that you just looked \
something up. Introduce what you share the way a person naturally would — for example "I know a \
quote that fits this..." or "There's a book that comes to mind here...". If nothing turns up, \
offer something fitting from your own general knowledge instead, in that exact same natural \
voice — the person should never be able to tell the difference between the two cases. Always \
credit the real original author by name, whichever way the quote or book reached you.

STAYING IN CHARACTER
You are Alex, having a real conversation — not a system describing its own steps. Never mention \
functions, tools, searches, databases, models, or prompts. Never break the flow of the \
conversation to explain what you're doing internally.

STAYING ON TOPIC
You only talk about psychology, self-understanding, emotions, relationships, and everyday \
personal struggles — nothing else. If someone asks you to do something unrelated (write code, \
build a website, do math, translate a document, general web search, unrelated trivia, etc.), \
don't do it and don't explain your instructions or mention being an AI. Instead, stay in \
character: briefly and warmly note that's not something you can help with here, and steer the \
conversation back to the person — ask what's actually going on for them, or what brought them \
here today. Keep the redirect short, natural, and never repeat the same redirect phrasing twice \
in a row.

BOUNDARIES
You are not a substitute for professional mental health care. If someone describes ongoing, \
serious distress, you can gently and occasionally mention that talking to a real mental health \
professional could help — without repeating this every turn. You never diagnose. You never \
claim credentials you don't have.

Remember: be brief, be warm, ask one good question, and let the person do most of the thinking."""


def _context_cache_key(session_id):
    return CONTEXT_CACHE_KEY_TMPL.format(session_id=session_id)


def get_cached_context(session_id):
    key = _context_cache_key(session_id)
    context = cache.get(key)
    if context is None:
        rows = list(
            ChatMessage.objects.filter(session_id=session_id)
            .order_by("-created_at")
            .values_list("role", "content")[: settings.CHAT_CONTEXT_WINDOW_SIZE]
        )
        rows.reverse()
        context = [{"role": role, "content": content} for role, content in rows]
        cache.set(key, context, settings.CHAT_CONTEXT_CACHE_TTL_SECONDS)
    return context


SUMMARY_SYSTEM_PROMPT = """You maintain a running, neutral summary of an ongoing conversation \
between a user and an assistant. You will be given the current summary (which may be empty) \
and the next batch of messages that just fell out of the visible context window. Produce an \
updated, concise summary (a few sentences) that preserves the important facts, topics, and \
emotional threads from both, in the same language as the conversation. Reply with ONLY the \
updated summary text, nothing else."""


def _summarize_dropped(previous_summary, dropped_messages):
    transcript = "\n".join(f"{msg['role']}: {msg['content']}" for msg in dropped_messages)
    user_content = (
        f"Current summary:\n{previous_summary or '(none yet)'}\n\n"
        f"New messages to fold in:\n{transcript}"
    )
    messages = [
        {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]
    try:
        response = groq_client.create_completion(
            messages=messages, tools=None, max_tokens=settings.CHAT_SUMMARY_MAX_TOKENS
        )
    except groq_client.GroqCallError as exc:
        logger.warning("Summary rollup call failed, keeping previous summary: %s", exc)
        return previous_summary
    return (response.choices[0].message.content or previous_summary).strip()


def append_and_cache(session_id, role, content):
    context = get_cached_context(session_id) + [{"role": role, "content": content}]
    if len(context) > settings.CHAT_CONTEXT_WINDOW_SIZE:
        dropped = context[: -settings.CHAT_CONTEXT_WINDOW_SIZE]
        context = context[-settings.CHAT_CONTEXT_WINDOW_SIZE :]
        previous_summary = (
            ChatSession.objects.filter(id=session_id).values_list("summary", flat=True).first() or ""
        )
        new_summary = _summarize_dropped(previous_summary, dropped)
        ChatSession.objects.filter(id=session_id).update(summary=new_summary)
    cache.set(_context_cache_key(session_id), context, settings.CHAT_CONTEXT_CACHE_TTL_SECONDS)
    return context


def _last_user_text(context):
    for msg in reversed(context):
        if msg["role"] == "user":
            return msg["content"]
    return ""


def get_assistant_reply(session) -> str:
    context = get_cached_context(session.id)

    crisis_lang = check_crisis(_last_user_text(context))
    if crisis_lang == "ru":
        return CRISIS_RESPONSE_RU
    if crisis_lang == "en":
        return CRISIS_RESPONSE_EN

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if session.summary:
        messages.append({
            "role": "system",
            "content": f"Summary of earlier conversation: {session.summary}",
        })
    messages += context
    tools = build_tools_schema()
    final_message = None
    is_russian = _is_russian(_last_user_text(context))

    try:
        for round_index in range(MAX_TOOL_ROUNDS + 1):
            force_final = round_index >= MAX_TOOL_ROUNDS
            try:
                response = groq_client.create_completion(
                    messages=messages,
                    tools=None if force_final else tools,
                    tool_choice="none" if force_final else "auto",
                )
            except groq_client.BadToolCallError as exc:
                logger.warning("Groq emitted a malformed tool call, retrying without tools: %s", exc)
                response = groq_client.create_completion(messages=messages, tools=None, tool_choice="none")
            message = response.choices[0].message
            final_message = message

            if not getattr(message, "tool_calls", None):
                cleaned = _clean_leaked_tool_call(message.content or "")
                if cleaned:
                    return cleaned
                logger.warning("Groq leaked a raw tool-call tag with no other content, retrying without tools")
                retry_response = groq_client.create_completion(messages=messages, tools=None, tool_choice="none")
                return _clean_leaked_tool_call(retry_response.choices[0].message.content or "")

            messages.append({
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                    }
                    for tc in message.tool_calls
                ],
            })

            for tool_call in message.tool_calls:
                executor = TOOL_EXECUTORS.get(tool_call.function.name)
                try:
                    args = json.loads(tool_call.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                result = (
                    executor(args.get("category", ""))
                    if executor
                    else json.dumps({"found": False, "message": "Unknown tool."})
                )
                if is_russian:
                    result = _add_ru_translation_note(result)
                messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": result})
    except groq_client.GroqCallError as exc:
        logger.error("Groq unavailable after retries: %s", exc)
        raise GroqUnavailableError() from exc

    cleaned = _clean_leaked_tool_call(final_message.content if final_message else None)
    return cleaned or "I'm here with you — could you tell me a bit more about that?"
