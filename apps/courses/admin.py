from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from .models import Course, CourseEnrollment, CourseStage, CourseStageCompletion


class CourseStageInline(TabularInline):
    model = CourseStage
    extra = 1
    ordering = ["stage_number"]
    autocomplete_fields = ["quote", "book"]


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ["title", "is_published", "cover_preview"]
    list_filter = ["is_published", "categories"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["categories"]
    inlines = [CourseStageInline]

    @admin.display(description="Cover")
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="height:40px;border-radius:4px;" />', obj.cover_image)
        return "—"


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(ModelAdmin):
    list_display = ["user", "course", "current_stage", "completed_at"]
    list_select_related = ["user", "course"]
    autocomplete_fields = ["user", "course"]


@admin.register(CourseStageCompletion)
class CourseStageCompletionAdmin(ModelAdmin):
    list_display = ["enrollment", "stage", "created_at"]
    list_select_related = ["enrollment", "stage"]
