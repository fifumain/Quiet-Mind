from rest_framework import serializers

from .models import MoodCheckIn


class MoodCheckInSerializer(serializers.ModelSerializer):
    # The date is always today, decided by the server (timezone.localdate()),
    # the same reasoning as QuoteOfTheDay.day — a client-supplied date would let
    # someone backfill or rewrite history.
    date = serializers.DateField(read_only=True)

    class Meta:
        model = MoodCheckIn
        fields = ["date", "mood", "note", "created_at"]
