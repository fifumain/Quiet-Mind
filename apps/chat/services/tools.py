import json
import random

from .category_cache import get_books_for_category, get_category_slugs, get_quotes_for_category


def build_tools_schema():
    slugs = get_category_slugs() or ["general"]

    return [
        {
            "type": "function",
            "function": {
                "name": "find_quote",
                "description": (
                    "Look up a real quote from the app's curated library for a psychology-related "
                    "category. Use this when quoting a known author would genuinely strengthen your "
                    "reply — not on every turn."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {"type": "string", "enum": slugs, "description": "Category slug."}
                    },
                    "required": ["category"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "find_book",
                "description": (
                    "Look up a book recommendation from the app's curated library for a "
                    "psychology-related category. Use this when recommending further reading "
                    "would genuinely help — not on every turn."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {"type": "string", "enum": slugs, "description": "Category slug."}
                    },
                    "required": ["category"],
                },
            },
        },
    ]


def execute_find_quote(category: str) -> str:
    quotes = get_quotes_for_category(category)
    if not quotes:
        return json.dumps({
            "found": False,
            "message": (
                "No quote exists in our library for this category. You may share a well-known "
                "quote from your own knowledge instead, crediting its real author — but do not "
                "claim it came from our library."
            ),
        })
    chosen = random.choice(quotes)
    return json.dumps({
        "found": True,
        "text": chosen["text"],
        "author": chosen["author_name"],
        "source": chosen.get("source") or None,
    })


def execute_find_book(category: str) -> str:
    books = get_books_for_category(category)
    if not books:
        return json.dumps({
            "found": False,
            "message": (
                "No book exists in our library for this category. You may recommend a well-known "
                "book from your own knowledge instead, crediting its real author — but do not "
                "claim it came from our library."
            ),
        })
    chosen = random.choice(books)
    return json.dumps({
        "found": True,
        "title": chosen["title"],
        "author": chosen["author_name"],
        "description": chosen.get("description") or None,
    })


TOOL_EXECUTORS = {"find_quote": execute_find_quote, "find_book": execute_find_book}
