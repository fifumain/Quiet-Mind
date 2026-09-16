import types

import pytest
from django.conf import settings
from django.core.cache import cache

from apps.chat.services import conversation, groq_client
from apps.chat.tests.factories import ChatMessageFactory, ChatSessionFactory

pytestmark = pytest.mark.django_db


def _fake_completion(content):
    message = types.SimpleNamespace(content=content, tool_calls=None)
    choice = types.SimpleNamespace(message=message)
    return types.SimpleNamespace(choices=[choice])


def test_get_cached_context_falls_back_to_db_and_warms_cache():
    session = ChatSessionFactory()
    ChatMessageFactory(session=session, role="user", content="first")
    ChatMessageFactory(session=session, role="assistant", content="second")
    ChatMessageFactory(session=session, role="user", content="third")

    key = conversation._context_cache_key(session.id)
    assert cache.get(key) is None

    context = conversation.get_cached_context(session.id)

    assert [m["content"] for m in context] == ["first", "second", "third"]
    assert cache.get(key) == context


def test_append_and_cache_trims_window_and_folds_overflow_into_summary(mocker):
    session = ChatSessionFactory(summary="")
    window_size = settings.CHAT_CONTEXT_WINDOW_SIZE
    full_context = [{"role": "user", "content": f"msg {i}"} for i in range(window_size)]
    cache.set(conversation._context_cache_key(session.id), full_context, 3600)

    mock_completion = mocker.patch.object(
        groq_client, "create_completion", return_value=_fake_completion("Updated running summary.")
    )

    new_context = conversation.append_and_cache(session.id, "user", "one message too many")

    assert len(new_context) == window_size
    assert new_context[-1]["content"] == "one message too many"
    assert new_context[0]["content"] == "msg 1"  # "msg 0" is the one that fell out
    mock_completion.assert_called_once()

    session.refresh_from_db(fields=["summary"])
    assert session.summary == "Updated running summary."


def test_append_and_cache_keeps_previous_summary_if_groq_call_fails(mocker):
    session = ChatSessionFactory(summary="Previous summary.")
    window_size = settings.CHAT_CONTEXT_WINDOW_SIZE
    full_context = [{"role": "user", "content": f"msg {i}"} for i in range(window_size)]
    cache.set(conversation._context_cache_key(session.id), full_context, 3600)

    mocker.patch.object(groq_client, "create_completion", side_effect=groq_client.GroqCallError("boom"))

    conversation.append_and_cache(session.id, "user", "one message too many")

    session.refresh_from_db(fields=["summary"])
    assert session.summary == "Previous summary."
