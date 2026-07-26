from django.db.models.signals import m2m_changed, post_delete, post_save

from apps.core.cache import invalidate_all_list_caches

from .models import Course, CourseStage


def _invalidate(**kwargs):
    invalidate_all_list_caches()


# Course content changes (published catalog + nested stages) invalidate the
# cached list responses. Enrollment/completion are per-user and never cached.
post_save.connect(_invalidate, sender=Course)
post_delete.connect(_invalidate, sender=Course)
m2m_changed.connect(_invalidate, sender=Course.categories.through)
post_save.connect(_invalidate, sender=CourseStage)
post_delete.connect(_invalidate, sender=CourseStage)
