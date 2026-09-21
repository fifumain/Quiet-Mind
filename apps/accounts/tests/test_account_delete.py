import pytest
from django.urls import reverse

from apps.chat.models import ChatMessage
from apps.chat.tests.factories import ChatMessageFactory, ChatSessionFactory
from apps.checkins.models import MoodCheckIn
from apps.checkins.tests.factories import MoodCheckInFactory
from apps.quotes.models import FavoriteQuote
from apps.quotes.tests.factories import QuoteFactory

pytestmark = pytest.mark.django_db


def test_account_delete_requires_authentication(api_client):
    response = api_client.delete(reverse("account-delete"))
    assert response.status_code == 401


def test_account_delete_cascades_all_owned_data(auth_client, user):
    session = ChatSessionFactory(user=user)
    ChatMessageFactory(session=session)
    MoodCheckInFactory(user=user)
    FavoriteQuote.objects.create(user=user, quote=QuoteFactory())

    response = auth_client.delete(reverse("account-delete"))

    assert response.status_code == 204
    assert not ChatMessage.objects.filter(session__user_id=user.id).exists()
    assert not MoodCheckIn.objects.filter(user_id=user.id).exists()
    assert not FavoriteQuote.objects.filter(user_id=user.id).exists()
    assert not type(user).objects.filter(pk=user.pk).exists()
