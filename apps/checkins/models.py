from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class MoodCheckIn(TimestampedModel):
    MOOD_CHOICES = [
        ("great", "Great"),
        ("good", "Good"),
        ("okay", "Okay"),
        ("low", "Low"),
        ("struggling", "Struggling"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mood_checkins")
    date = models.DateField()
    mood = models.CharField(max_length=16, choices=MOOD_CHOICES)
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ["user", "date"]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user} — {self.date}: {self.mood}"
