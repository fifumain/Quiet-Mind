import datetime

import pytest
from django.urls import reverse
from django.utils import timezone

from apps.checkins.models import MoodCheckIn
from apps.checkins.tests.factories import MoodCheckInFactory
from apps.core.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_get_today_without_checkin_returns_404(auth_client):
    response = auth_client.get(reverse("mood-today"))

    assert response.status_code == 404
    assert response.data["detail"] == "No check-in submitted for today yet."


def test_post_creates_checkin_for_today(auth_client, user):
    response = auth_client.post(reverse("mood-today"), {"mood": "good", "note": "decent day"})

    assert response.status_code == 200
    assert response.data["mood"] == "good"

    checkin = MoodCheckIn.objects.get(user=user, date=timezone.localdate())
    assert checkin.mood == "good"
    assert checkin.note == "decent day"


def test_repeated_post_same_day_updates_in_place(auth_client, user):
    auth_client.post(reverse("mood-today"), {"mood": "low", "note": "rough morning"})
    auth_client.post(reverse("mood-today"), {"mood": "good", "note": "better now"})

    checkins = MoodCheckIn.objects.filter(user=user, date=timezone.localdate())
    assert checkins.count() == 1
    assert checkins.first().mood == "good"
    assert checkins.first().note == "better now"


def test_history_is_ordered_and_scoped_to_requesting_user(auth_client, user):
    other_user = UserFactory()
    today = timezone.localdate()
    MoodCheckInFactory(user=user, date=today - datetime.timedelta(days=2), mood="okay")
    MoodCheckInFactory(user=user, date=today, mood="great")
    MoodCheckInFactory(user=other_user, date=today, mood="struggling")

    response = auth_client.get(reverse("mood-history"))

    assert response.status_code == 200
    moods = [entry["mood"] for entry in response.data["results"]]
    assert moods == ["great", "okay"]
