import pytest
from django.urls import reverse

from apps.quotes.models import FavoriteQuote
from apps.quotes.tests.factories import QuoteFactory

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("basename", ["quote", "author", "category"])
def test_content_endpoints_are_read_only(api_client, basename):
    list_url = reverse(f"{basename}-list")
    assert api_client.post(list_url, {}).status_code == 405

    quote = QuoteFactory()
    # For author/category the detail pk doesn't need to exist — ReadOnlyModelViewSet
    # never registers a put/delete route at all, so 405 is returned before any
    # object lookup happens.
    detail_pk = quote.pk if basename == "quote" else 1
    detail_url = reverse(f"{basename}-detail", kwargs={"pk": detail_pk})
    assert api_client.put(detail_url, {}).status_code == 405
    assert api_client.delete(detail_url).status_code == 405


def test_favorite_requires_authentication(api_client):
    quote = QuoteFactory()

    response = api_client.post(reverse("quote-favorite", kwargs={"pk": quote.pk}))

    assert response.status_code == 401


def test_favorite_toggle_add_and_remove(auth_client, user):
    quote = QuoteFactory()
    url = reverse("quote-favorite", kwargs={"pk": quote.pk})

    added = auth_client.post(url)
    assert added.status_code == 200
    assert added.data["is_favorited"] is True
    assert FavoriteQuote.objects.filter(user=user, quote=quote).exists()

    removed = auth_client.delete(url)
    assert removed.status_code == 200
    assert removed.data["is_favorited"] is False
    assert not FavoriteQuote.objects.filter(user=user, quote=quote).exists()
