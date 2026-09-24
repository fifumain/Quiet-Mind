import types

import pytest

from apps.chat.services import groq_client, moderation


def _fake_completion(json_text):
    message = types.SimpleNamespace(content=json_text)
    return types.SimpleNamespace(choices=[types.SimpleNamespace(message=message)])


def test_classify_message_parses_valid_json(mocker):
    mocker.patch.object(
        groq_client,
        "create_completion",
        return_value=_fake_completion('{"on_topic": false, "crisis": false, "lang": "ru"}'),
    )

    result = moderation.classify_message("напиши код для сортировки списка")

    assert result == moderation.ModerationResult(on_topic=False, crisis=False, lang="ru")


def test_classify_message_defaults_unknown_lang_to_other(mocker):
    mocker.patch.object(
        groq_client,
        "create_completion",
        return_value=_fake_completion('{"on_topic": true, "crisis": false, "lang": "pl"}'),
    )

    result = moderation.classify_message("jak się dzisiaj czujesz")

    assert result.lang == "other"


def test_classify_message_fails_open_on_groq_error(mocker):
    mocker.patch.object(groq_client, "create_completion", side_effect=groq_client.GroqCallError("down"))

    result = moderation.classify_message("hello")

    assert result == moderation.ModerationResult(on_topic=True, crisis=False, lang="other")


def test_classify_message_fails_open_on_invalid_json(mocker):
    mocker.patch.object(groq_client, "create_completion", return_value=_fake_completion("not json at all"))

    result = moderation.classify_message("hello")

    assert result == moderation.ModerationResult(on_topic=True, crisis=False, lang="other")


def test_classify_message_ignores_empty_text():
    assert moderation.classify_message("") == moderation.ModerationResult(on_topic=True, crisis=False, lang="other")
    assert moderation.classify_message(None) == moderation.ModerationResult(on_topic=True, crisis=False, lang="other")


@pytest.mark.parametrize("field", ["on_topic", "crisis"])
def test_classify_message_defaults_missing_fields(mocker, field):
    payload = {"on_topic": True, "crisis": False, "lang": "en"}
    del payload[field]
    import json

    mocker.patch.object(groq_client, "create_completion", return_value=_fake_completion(json.dumps(payload)))

    result = moderation.classify_message("hi")

    assert result.on_topic is True
    assert result.crisis is False
