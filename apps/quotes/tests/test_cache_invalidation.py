import pytest
from django.urls import reverse

from apps.chat.services.category_cache import get_category_slugs, get_quotes_for_category
from apps.quotes.tests.factories import CategoryFactory, QuoteFactory

pytestmark = pytest.mark.django_db


def test_creating_quote_invalidates_list_cache(api_client):
    first = api_client.get(reverse("quote-list"))
    assert first.status_code == 200
    assert first.data["results"] == []

    QuoteFactory(text="A new quote")

    second = api_client.get(reverse("quote-list"))
    assert [q["text"] for q in second.data["results"]] == ["A new quote"]


def test_deleting_author_invalidates_chat_category_cache():
    category = CategoryFactory(slug="stoicism")
    assert get_category_slugs() == ["stoicism"]

    quote = QuoteFactory(categories=[category])
    assert len(get_quotes_for_category("stoicism")) == 1

    quote.author.delete()  # cascades to the Quote itself

    assert get_quotes_for_category("stoicism") == []
