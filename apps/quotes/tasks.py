import random

from celery import shared_task
from django.utils import timezone

from .models import Quote, QuoteOfTheDay


@shared_task
def pick_quote_of_the_day():
    today = timezone.localdate()
    if QuoteOfTheDay.objects.filter(day=today).exists():
        return

    all_ids = list(Quote.objects.values_list("id", flat=True))
    if not all_ids:
        return

    recent_ids = list(
        QuoteOfTheDay.objects.order_by("-day").values_list("quote_id", flat=True)[:9]
    )
    candidates = [pk for pk in all_ids if pk not in recent_ids]
    if not candidates:
        # Catalog too small to honor the full 9-quote exclusion window —
        # fall back to just avoiding an immediate repeat of the last pick.
        last_id = recent_ids[0] if recent_ids else None
        candidates = [pk for pk in all_ids if pk != last_id] or all_ids

    chosen_id = random.choice(candidates)
    QuoteOfTheDay.objects.create(quote_id=chosen_id, day=today)
