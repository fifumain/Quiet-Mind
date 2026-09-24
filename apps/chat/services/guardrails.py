import re
from typing import Optional

CRISIS_PATTERNS_EN = [
    r"\bkill (myself|me)\b",
    r"\bsuicid(e|al)\b",
    r"\bend my life\b",
    r"\bwant(ed)? to die\b",
    r"\bself[- ]harm\b",
    r"\bhurt(ing)? myself\b",
    r"\bcutting myself\b",
    r"\bno reason to live\b",
    r"\bbetter off dead\b",
    # Added for indirect phrasing that doesn't use the words above directly.
    r"\bdon'?t want to (be here|exist) anymore\b",
    r"\bno point (in )?(going on|living)\b",
    r"\bcan'?t (do this|go on) anymore\b",
    r"\bwish I (was|were) dead\b",
    r"\bplanning to (end|take) my life\b",
]

CRISIS_PATTERNS_RU = [
    r"покончить с собой",
    r"самоубийств",
    r"суицид",
    r"не хочу жить",
    r"хочу умереть",
    r"причинить себе вред",
    r"порезать себя",
    r"нет смысла жить",
    r"лучше бы я умер",
    # Added for indirect phrasing that doesn't use the words above directly.
    r"не хочу больше жить",
    r"не вижу смысла жить дальше",
    r"больше не могу так",
    r"хочу исчезнуть",
]

CRISIS_PATTERNS_UK = [
    r"покінчити з собою",
    r"самогубств",
    r"суїцид",
    r"не хочу жити",
    r"хочу померти",
    r"хочу вмерти",
    r"завдати собі шкоди",
    r"порізати себе",
    r"немає сенсу жити",
    r"краще б я помер",
    # Added for indirect phrasing that doesn't use the words above directly.
    r"не хочу більше жити",
    r"не бачу сенсу жити далі",
    r"більше не можу так",
    r"хочу зникнути",
]

_EN_RE = re.compile("|".join(CRISIS_PATTERNS_EN), re.IGNORECASE)
_RU_RE = re.compile("|".join(CRISIS_PATTERNS_RU), re.IGNORECASE)
_UK_RE = re.compile("|".join(CRISIS_PATTERNS_UK), re.IGNORECASE)


def check_crisis(text: str) -> Optional[str]:
    if not text:
        return None
    if _RU_RE.search(text):
        return "ru"
    if _UK_RE.search(text):
        return "uk"
    if _EN_RE.search(text):
        return "en"
    return None


CRISIS_RESPONSE_EN = (
    "I'm really glad you told me this, and I want you to be safe. I'm not able to provide "
    "crisis support myself, but please reach out right now to people who can — contact your "
    "local emergency number, look up a crisis helpline in your country, or reach out to a "
    "mental health professional. If there's someone nearby you trust, let them know what's "
    "going on too. You don't have to go through this alone."
)

CRISIS_RESPONSE_RU = (
    "Мне важно, что ты рассказал(а) мне об этом, и я хочу, чтобы ты был(а) в безопасности. "
    "Я не могу оказать кризисную помощь сам, но, пожалуйста, обратись прямо сейчас к тем, кто "
    "может: позвони на номер экстренной помощи в своей стране, найди кризисную линию "
    "психологической помощи у себя в регионе, или обратись к специалисту. Если рядом есть "
    "тот, кому ты доверяешь — дай ему знать, что происходит. Тебе не нужно проходить через "
    "это в одиночку."
)

CRISIS_RESPONSE_UK = (
    "Мені важливо, що ти розповів(-ла) мені про це, і я хочу, щоб ти був(-ла) у безпеці. "
    "Я не можу сам надати кризову допомогу, але, будь ласка, звернись прямо зараз до тих, хто "
    "може: подзвони на номер екстреної допомоги у своїй країні, знайди лінію кризової "
    "психологічної підтримки у своєму регіоні, або звернись до фахівця. Якщо поруч є хтось, "
    "кому ти довіряєш — розкажи їм, що відбувається. Тобі не потрібно проходити через це "
    "наодинці."
)

CRISIS_RESPONSES = {
    "en": CRISIS_RESPONSE_EN,
    "ru": CRISIS_RESPONSE_RU,
    "uk": CRISIS_RESPONSE_UK,
}

OFF_TOPIC_RESPONSE_EN = (
    "That's not something I can help with here — I'm just here to listen and talk through "
    "what's going on for you emotionally. What's actually on your mind today?"
)

OFF_TOPIC_RESPONSE_RU = (
    "Это не то, с чем я могу помочь здесь — я просто рядом, чтобы выслушать и поговорить о "
    "том, что происходит у тебя внутри. Что на самом деле сейчас у тебя на душе?"
)

OFF_TOPIC_RESPONSE_UK = (
    "Це не те, з чим я можу тут допомогти — я просто поруч, щоб вислухати і поговорити про "
    "те, що відбувається в тебе всередині. Що насправді зараз у тебе на душі?"
)

OFF_TOPIC_RESPONSES = {
    "en": OFF_TOPIC_RESPONSE_EN,
    "ru": OFF_TOPIC_RESPONSE_RU,
    "uk": OFF_TOPIC_RESPONSE_UK,
}
