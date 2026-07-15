from django.db.models.signals import m2m_changed, post_delete, post_save

from apps.chat.services.category_cache import invalidate_category_cache
from apps.core.cache import invalidate_all_list_caches

from .models import Book


def _invalidate(**kwargs):
    invalidate_category_cache()
    invalidate_all_list_caches()


post_save.connect(_invalidate, sender=Book)
post_delete.connect(_invalidate, sender=Book)
m2m_changed.connect(_invalidate, sender=Book.categories.through)
