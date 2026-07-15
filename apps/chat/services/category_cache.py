from django.conf import settings
from django.core.cache import cache
from django.db.models import F

from apps.books.models import Book
from apps.quotes.models import Category, Quote

TOOL_CACHE_PREFIX = "chat:tool"


def _slugs_key():
    return f"{TOOL_CACHE_PREFIX}:category_slugs"


def _quotes_key(slug):
    return f"{TOOL_CACHE_PREFIX}:quotes:{slug}"


def _books_key(slug):
    return f"{TOOL_CACHE_PREFIX}:books:{slug}"


def get_category_slugs():
    slugs = cache.get(_slugs_key())
    if slugs is None:
        slugs = list(Category.objects.order_by("slug").values_list("slug", flat=True))
        cache.set(_slugs_key(), slugs, settings.CHAT_TOOL_CACHE_TTL_SECONDS)
    return slugs


def get_quotes_for_category(slug):
    key = _quotes_key(slug)
    quotes = cache.get(key)
    if quotes is None:
        quotes = list(
            Quote.objects.filter(categories__slug=slug).values("text", "source", author_name=F("author__name"))
        )
        cache.set(key, quotes, settings.CHAT_TOOL_CACHE_TTL_SECONDS)
    return quotes


def get_books_for_category(slug):
    key = _books_key(slug)
    books = cache.get(key)
    if books is None:
        books = list(
            Book.objects.filter(categories__slug=slug).values("title", "description", author_name=F("author__name"))
        )
        cache.set(key, books, settings.CHAT_TOOL_CACHE_TTL_SECONDS)
    return books


def invalidate_category_cache():
    cache.delete(_slugs_key())
    cache.delete_pattern(f"{TOOL_CACHE_PREFIX}:quotes:*")
    cache.delete_pattern(f"{TOOL_CACHE_PREFIX}:books:*")
