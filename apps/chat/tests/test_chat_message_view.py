import types

import pytest
from django.core.cache import cache
from django.urls import reverse

from apps.chat.models import ChatMessage
from apps.chat.services import conversation, groq_client
from apps.chat.services.guardrails import CRISIS_RESPONSE_EN

pytestmark = pytest.mark.django_db

MESSAGES_URL = "chat-messages"


def _fake_message(content=None, tool_calls=None):
    return types.SimpleNamespace(content=content, tool_calls=tool_calls)


def _fake_completion(content=None, tool_calls=None):
    return types.SimpleNamespace(choices=[types.SimpleNamespace(message=_fake_message(content, tool_calls))])


def _fake_tool_call(call_id, name, arguments):
    return types.SimpleNamespace(
        id=call_id, function=types.SimpleNamespace(name=name, arguments=arguments)
    )


def test_crisis_message_short_circuits_groq(auth_client, mocker):
    mock_completion = mocker.patch.object(groq_client, "create_completion")

    response = auth_client.post(reverse(MESSAGES_URL), {"content": "I want to kill myself"})

    assert response.status_code == 201
    assert response.data["assistant_message"]["content"] == CRISIS_RESPONSE_EN
    mock_completion.assert_not_called()
    assert ChatMessage.objects.filter(role="assistant", content=CRISIS_RESPONSE_EN).exists()


def test_normal_message_persists_mocked_reply_and_updates_context_cache(auth_client, mocker):
    mocker.patch.object(groq_client, "create_completion", return_value=_fake_completion("I'm here for you."))

    response = auth_client.post(reverse(MESSAGES_URL), {"content": "I had a hard day"})

    assert response.status_code == 201
    assert response.data["assistant_message"]["content"] == "I'm here for you."

    session_id = ChatMessage.objects.get(role="user", content="I had a hard day").session_id
    cached = cache.get(conversation._context_cache_key(session_id))
    assert [m["content"] for m in cached] == ["I had a hard day", "I'm here for you."]


def test_tool_calling_round_trip_folds_result_into_final_reply(auth_client, mocker):
    tool_call_response = _fake_completion(
        content=None,
        tool_calls=[_fake_tool_call("call_1", "find_quote", '{"category": "stoicism"}')],
    )
    final_response = _fake_completion(content="Here's something Seneca once said.")
    mocker.patch.object(groq_client, "create_completion", side_effect=[tool_call_response, final_response])

    response = auth_client.post(reverse(MESSAGES_URL), {"content": "I keep worrying about things I can't control"})

    assert response.status_code == 201
    assert response.data["assistant_message"]["content"] == "Here's something Seneca once said."


def test_groq_unavailable_returns_503_without_creating_assistant_message(auth_client, mocker):
    mocker.patch.object(groq_client, "create_completion", side_effect=groq_client.GroqCallError("down"))

    response = auth_client.post(reverse(MESSAGES_URL), {"content": "just checking in"})

    assert response.status_code == 503
    assert not ChatMessage.objects.filter(role="assistant").exists()


def test_message_over_max_length_is_rejected(auth_client, mocker):
    mock_completion = mocker.patch.object(groq_client, "create_completion")

    response = auth_client.post(reverse(MESSAGES_URL), {"content": "x" * 4001})

    assert response.status_code == 400
    assert "content" in response.data
    mock_completion.assert_not_called()


def test_chat_message_post_is_throttled_but_history_get_is_not(auth_client, mocker, settings):
    mocker.patch.object(groq_client, "create_completion", return_value=_fake_completion("ok"))
    rate = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["chat_message"]
    limit = int(rate.split("/")[0])

    for _ in range(limit):
        response = auth_client.post(reverse(MESSAGES_URL), {"content": "hi"})
        assert response.status_code == 201

    over_limit = auth_client.post(reverse(MESSAGES_URL), {"content": "hi"})
    assert over_limit.status_code == 429

    # GET (reading history) is explicitly exempt from the same throttle scope.
    history = auth_client.get(reverse(MESSAGES_URL))
    assert history.status_code == 200
