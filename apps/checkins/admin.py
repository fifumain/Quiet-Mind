from unfold.admin import ModelAdmin

from django.contrib import admin

from .models import MoodCheckIn


@admin.register(MoodCheckIn)
class MoodCheckInAdmin(ModelAdmin):
    list_display = ["user", "date", "mood"]
    list_filter = ["mood"]
    date_hierarchy = "date"
    autocomplete_fields = ["user"]
