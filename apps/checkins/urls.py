from django.urls import path

from .views import MoodHistoryView, MoodTodayView

urlpatterns = [
    path("mood/today/", MoodTodayView.as_view(), name="mood-today"),
    path("mood/history/", MoodHistoryView.as_view(), name="mood-history"),
]
