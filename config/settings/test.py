from .dev import *  # noqa: F403

# django-redis (the production/dev cache backend) needs a real Redis instance;
# LocMemCache keeps the test suite self-contained. The one thing this breaks
# is `cache.delete_pattern(...)` (a django-redis extension, not part of
# Django's base cache API, used by apps/core/cache.py and
# apps/chat/services/category_cache.py) — the root conftest.py patches a
# minimal equivalent onto LocMemCache for the test process only.
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"},
}
