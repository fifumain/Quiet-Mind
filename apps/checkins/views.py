from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MoodCheckIn
from .serializers import MoodCheckInSerializer


class MoodTodayView(APIView):
    permission_classes = [IsAuthenticated]

    # A bare APIView has no queryset/serializer_class for drf-spectacular to
    # infer a schema from (the same gap FavoriteQuoteIdsView hit in
    # apps/quotes/views.py) — spelled out explicitly here instead.
    @extend_schema(responses=MoodCheckInSerializer)
    def get(self, request):
        checkin = MoodCheckIn.objects.filter(user=request.user, date=timezone.localdate()).first()
        if checkin is None:
            return Response({"detail": "No check-in submitted for today yet."}, status=404)
        return Response(MoodCheckInSerializer(checkin).data)

    @extend_schema(request=MoodCheckInSerializer, responses=MoodCheckInSerializer)
    def post(self, request):
        serializer = MoodCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # update_or_create keyed on today's date makes this idempotent — the
        # user can correct their mood any number of times the same day instead
        # of accumulating duplicate rows.
        checkin, _ = MoodCheckIn.objects.update_or_create(
            user=request.user,
            date=timezone.localdate(),
            defaults={
                "mood": serializer.validated_data["mood"],
                "note": serializer.validated_data.get("note", ""),
            },
        )
        return Response(MoodCheckInSerializer(checkin).data)


class MoodHistoryView(generics.ListAPIView):
    serializer_class = MoodCheckInSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MoodCheckIn.objects.filter(user=self.request.user).order_by("-date")
