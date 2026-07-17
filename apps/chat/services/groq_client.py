import logging
import time

from django.conf import settings
from groq import (
    APIConnectionError,
    APITimeoutError,
    BadRequestError,
    Groq,
    InternalServerError,
    RateLimitError,
)

logger = logging.getLogger(__name__)

_client = None

RETRYABLE_EXCEPTIONS = (APIConnectionError, APITimeoutError, RateLimitError, InternalServerError)
MAX_ATTEMPTS = 3
BACKOFF_SECONDS = (0.5, 1.5)


class GroqCallError(Exception):
    """Raised after all retry attempts to reach Groq have failed."""


class BadToolCallError(Exception):
    """Raised when Groq rejects a malformed tool call the model itself generated
    (an occasional quirk of Llama tool-calling) — the caller should retry
    without tools rather than treating this as a hard failure."""


def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def create_completion(messages, tools=None, tool_choice="auto", max_tokens=None):
    client = get_client()
    last_exc = None
    for attempt in range(MAX_ATTEMPTS):
        try:
            kwargs = {
                "model": settings.GROQ_MODEL,
                "messages": messages,
                "temperature": settings.GROQ_TEMPERATURE,
                "max_tokens": max_tokens or settings.GROQ_MAX_TOKENS,
            }
            if tools is not None:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = tool_choice
            return client.chat.completions.create(**kwargs)
        except BadRequestError as exc:
            if "tool_use_failed" in str(exc):
                raise BadToolCallError(str(exc)) from exc
            raise
        except RETRYABLE_EXCEPTIONS as exc:
            last_exc = exc
            logger.warning("Groq call attempt %d/%d failed: %s", attempt + 1, MAX_ATTEMPTS, exc)
            if attempt < MAX_ATTEMPTS - 1:
                time.sleep(BACKOFF_SECONDS[attempt])
    raise GroqCallError(str(last_exc)) from last_exc
