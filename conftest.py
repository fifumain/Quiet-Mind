import fnmatch
import types

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.core.tests.factories import UserFactory

__all__ = ["UserFactory"]


def _locmem_delete_pattern(self, pattern):
    """LocMemCache has no `delete_pattern` — that's an extension the real
    django-redis backend provides, and apps/core/cache.py and
    apps/chat/services/category_cache.py both rely on it for invalidation.
    Test settings swap in LocMemCache for simplicity (config/settings/test.py),
    so this shim adds a minimal equivalent for the test process only."""
    to_delete = []
    for stored_key in list(self._cache.keys()):
        # LocMemCache's internal keys are "<prefix>:<version>:<original_key>";
        # the pattern callers pass is always in terms of the original key.
        parts = stored_key.split(":", 2)
        original_key = parts[2] if len(parts) == 3 else stored_key
        if fnmatch.fnmatch(original_key, pattern):
            to_delete.append(original_key)
    for key in to_delete:
        self.delete(key)


@pytest.fixture(autouse=True)
def _cache_shim_and_clear():
    if not hasattr(cache, "delete_pattern"):
        cache.delete_pattern = types.MethodType(_locmem_delete_pattern, cache)
    yield
    cache.clear()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
