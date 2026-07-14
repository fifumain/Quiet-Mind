import random

from celery import shared_task
from django.utils import timezone

from .models import Book, FeaturedBook


@shared_task
def pick_featured_book():
    today = timezone.localdate()
    if FeaturedBook.objects.filter(week_start=today).exists():
        return

    all_ids = list(Book.objects.values_list("id", flat=True))
    if not all_ids:
        return

    recent_ids = list(
        FeaturedBook.objects.order_by("-week_start").values_list("book_id", flat=True)[:9]
    )
    candidates = [pk for pk in all_ids if pk not in recent_ids]
    if not candidates:
        # Catalog too small to honor the full 9-book exclusion window —
        # fall back to just avoiding an immediate repeat of the last pick.
        last_id = recent_ids[0] if recent_ids else None
        candidates = [pk for pk in all_ids if pk != last_id] or all_ids

    chosen_id = random.choice(candidates)
    FeaturedBook.objects.create(book_id=chosen_id, week_start=today)
