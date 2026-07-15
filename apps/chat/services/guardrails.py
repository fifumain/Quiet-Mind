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
]

_EN_RE = re.compile("|".join(CRISIS_PATTERNS_EN), re.IGNORECASE)
_RU_RE = re.compile("|".join(CRISIS_PATTERNS_RU), re.IGNORECASE)


def check_crisis(text: str) -> Optional[str]:
    if not text:
        return None
    if _RU_RE.search(text):
        return "ru"
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
