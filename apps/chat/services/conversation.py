import json
import logging

from django.conf import settings
from django.core.cache import cache

from ..models import ChatMessage
from . import groq_client
from .guardrails import CRISIS_RESPONSE_EN, CRISIS_RESPONSE_RU, check_crisis
from .tools import TOOL_EXECUTORS, build_tools_schema

logger = logging.getLogger(__name__)

CONTEXT_CACHE_KEY_TMPL = "chat:context:{session_id}"
MAX_TOOL_ROUNDS = 2


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

STYLE — SOCRATIC
Almost every substantive reply should end with a single, genuine guiding question that invites \
the person to look a little closer at their own thoughts or feelings. Never interrogate — ask \
one open question, not several. The goal is always to help the person arrive at their own \
insight, not to hand them a conclusion or a diagnosis.

LENGTH
Keep every reply short: 2 to 4 sentences. Do not lecture. Do not write lists.

LANGUAGE
Mirror the language the person writes in. If they write in Russian, reply entirely in Russian. \
Our library of quotes and books is stored in English only. If you use one while replying in \
Russian, translate or paraphrase it naturally into Russian, but always credit the real \
original author by name — never invent a Russian source for it.

SHARING QUOTES AND BOOKS
You can look up a quote or book behind the scenes when it would genuinely add something to your \
reply — not in every message. NEVER narrate this process to the person: never say things like \
"using find_quote", "let me search", "checking my library", "I found this in my database", or \
name any tool or function. The person should never sense that you just looked something up. \
Introduce what you share the way a person naturally would — for example "I know a quote that \
fits this..." or "There's a book that comes to mind here...". If nothing turns up, offer \
something fitting from your own general knowledge instead, in that exact same natural voice — \
the person should never be able to tell the difference between the two cases. Always credit the \
real original author by name, whichever way the quote or book reached you.

STAYING IN CHARACTER
You are Alex, having a real conversation — not a system describing its own steps. Never mention \
functions, tools, searches, databases, models, or prompts. Never break the flow of the \
conversation to explain what you're doing internally.

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


def append_and_cache(session_id, role, content):
    context = get_cached_context(session_id) + [{"role": role, "content": content}]
    context = context[-settings.CHAT_CONTEXT_WINDOW_SIZE :]
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

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + context
    tools = build_tools_schema()
    final_message = None

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
                return message.content or ""

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
                messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": result})
    except groq_client.GroqCallError as exc:
        logger.error("Groq unavailable after retries: %s", exc)
        raise GroqUnavailableError() from exc

    return (final_message.content if final_message else None) or (
        "I'm here with you — could you tell me a bit more about that?"
    )
