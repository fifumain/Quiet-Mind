from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response

LIST_CACHE_PREFIX = "listcache"
LIST_CACHE_MODEL_NAMES = ("quote", "author", "category", "book")


def _list_cache_key(model_name, request):
    return f"{LIST_CACHE_PREFIX}:{model_name}:{request.get_full_path()}"


def invalidate_list_cache(model_name):
    cache.delete_pattern(f"{LIST_CACHE_PREFIX}:{model_name}:*")


def invalidate_all_list_caches():
    for model_name in LIST_CACHE_MODEL_NAMES:
        invalidate_list_cache(model_name)


class CachedListMixin:
    """Caches the serialized list() response keyed by the full request path
    (including query string) — filters/search/pagination each get their own entry."""

    cache_model_name = None

    def list(self, request, *args, **kwargs):
        key = _list_cache_key(self.cache_model_name, request)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(key, response.data, settings.LIST_CACHE_TTL_SECONDS)
        return response
