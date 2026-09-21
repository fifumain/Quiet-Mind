import pytest

from apps.chat.services.guardrails import check_crisis


@pytest.mark.parametrize(
    "text",
    [
        "I want to kill myself",
        "sometimes I think about suicide",
        "I've been thinking a lot about how to end my life",
        "I just want to die",
        "I've been cutting myself lately",
        "honestly I feel better off dead",
    ],
)
def test_check_crisis_detects_english_phrases(text):
    assert check_crisis(text) == "en"


@pytest.mark.parametrize(
    "text",
    [
        "я хочу покончить с собой",
        "у меня мысли о самоубийстве",
        "не хочу жить",
        "иногда думаю о суициде",
    ],
)
def test_check_crisis_detects_russian_phrases(text):
    assert check_crisis(text) == "ru"


@pytest.mark.parametrize(
    "text",
    [
        "I don't want to be here anymore",
        "I don't want to exist anymore",
        "there's no point in going on",
        "there's no point living",
        "I can't do this anymore",
        "I can't go on anymore",
        "I wish I was dead",
        "I wish I were dead",
        "I've been planning to end my life",
        "I've been planning to take my life",
    ],
)
def test_check_crisis_detects_indirect_english_phrases(text):
    assert check_crisis(text) == "en"


@pytest.mark.parametrize(
    "text",
    [
        "я не хочу больше жить",
        "не вижу смысла жить дальше",
        "больше не могу так",
        "хочу исчезнуть",
    ],
)
def test_check_crisis_detects_indirect_russian_phrases(text):
    assert check_crisis(text) == "ru"


@pytest.mark.parametrize(
    "text",
    [
        "I had a rough day at work today",
        "мне сегодня было грустно, но всё в порядке",
        "",
        None,
    ],
)
def test_check_crisis_ignores_benign_text(text):
    assert check_crisis(text) is None


def test_check_crisis_is_case_insensitive():
    assert check_crisis("I WANT TO KILL MYSELF") == "en"


def test_check_crisis_respects_word_boundaries():
    # "skill myself" contains "kill myself" as a raw substring but the pattern
    # is \b-bounded, so it must NOT fire — a regression here would mean any
    # word merely containing a trigger phrase gets flagged.
    assert check_crisis("I have real skill myself when it comes to painting") is None


def test_check_crisis_prefers_russian_when_both_could_match():
    # Russian is checked first in check_crisis(); a message mixing both
    # languages should resolve to "ru" rather than "en".
    assert check_crisis("I want to kill myself, не хочу жить") == "ru"
