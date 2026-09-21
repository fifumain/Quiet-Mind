import pytest
from django.contrib.auth.models import User
from django.urls import reverse

pytestmark = pytest.mark.django_db

STRONG_PASSWORD = "S3cure!Pass99"


def test_register_creates_user(api_client):
    response = api_client.post(
        reverse("register"),
        {"username": "alice", "email": "alice@example.com", "password": STRONG_PASSWORD},
    )

    assert response.status_code == 201
    assert User.objects.filter(username="alice").exists()


def test_register_rejects_duplicate_email_case_insensitive(api_client):
    User.objects.create_user(username="existing", email="Alice@Example.com", password=STRONG_PASSWORD)

    response = api_client.post(
        reverse("register"),
        {"username": "alice2", "email": "alice@example.com", "password": STRONG_PASSWORD},
    )

    assert response.status_code == 400
    assert "email" in response.data


def test_register_is_throttled_per_ip(api_client, settings):
    rate = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["register"]
    limit = int(rate.split("/")[0])

    for i in range(limit):
        response = api_client.post(
            reverse("register"),
            {"username": f"user{i}", "email": f"user{i}@example.com", "password": STRONG_PASSWORD},
        )
        assert response.status_code == 201

    over_limit = api_client.post(
        reverse("register"),
        {"username": "one_too_many", "email": "one_too_many@example.com", "password": STRONG_PASSWORD},
    )
    assert over_limit.status_code == 429


def test_token_obtain_with_valid_credentials(api_client):
    User.objects.create_user(username="bob", password=STRONG_PASSWORD)

    response = api_client.post(reverse("token_obtain_pair"), {"username": "bob", "password": STRONG_PASSWORD})

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


def test_token_obtain_with_invalid_password(api_client):
    User.objects.create_user(username="bob", password=STRONG_PASSWORD)

    response = api_client.post(reverse("token_obtain_pair"), {"username": "bob", "password": "wrong-password"})

    assert response.status_code == 401


def test_refresh_rotates_and_blacklists_old_refresh_token(api_client):
    User.objects.create_user(username="carol", password=STRONG_PASSWORD)
    tokens = api_client.post(
        reverse("token_obtain_pair"), {"username": "carol", "password": STRONG_PASSWORD}
    ).data
    old_refresh = tokens["refresh"]

    refreshed = api_client.post(reverse("token_refresh"), {"refresh": old_refresh})
    assert refreshed.status_code == 200
    assert refreshed.data["refresh"] != old_refresh

    # SIMPLE_JWT["BLACKLIST_AFTER_ROTATION"] = True — the token just spent
    # must not be usable a second time.
    reused = api_client.post(reverse("token_refresh"), {"refresh": old_refresh})
    assert reused.status_code == 401


def test_blacklist_invalidates_refresh_token(api_client):
    User.objects.create_user(username="dave", password=STRONG_PASSWORD)
    tokens = api_client.post(
        reverse("token_obtain_pair"), {"username": "dave", "password": STRONG_PASSWORD}
    ).data

    blacklisted = api_client.post(reverse("token_blacklist"), {"refresh": tokens["refresh"]})
    assert blacklisted.status_code == 200

    reused = api_client.post(reverse("token_refresh"), {"refresh": tokens["refresh"]})
    assert reused.status_code == 401
