from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class Course(TimestampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    teaser = models.CharField(max_length=500, blank=True)  # short line for list cards
    description = models.TextField(blank=True)  # longer text for the expanded detail
    # URL to an externally-hosted cover image (same approach as Book.cover_image) —
    # keeps the project free of any upload/media infrastructure.
    cover_image = models.URLField(blank=True)
    categories = models.ManyToManyField("quotes.Category", related_name="courses", blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class CourseStage(TimestampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="stages")
    stage_number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=255)
    body = models.TextField()
    quote = models.ForeignKey(
        "quotes.Quote", on_delete=models.SET_NULL, null=True, blank=True, related_name="course_stages"
    )
    book = models.ForeignKey(
        "books.Book", on_delete=models.SET_NULL, null=True, blank=True, related_name="course_stages"
    )
    reflection_prompt = models.TextField(blank=True)

    class Meta:
        unique_together = ["course", "stage_number"]
        ordering = ["course", "stage_number"]

    def __str__(self):
        return f"{self.course.title} · этап {self.stage_number}: {self.title[:40]}"


class CourseEnrollment(TimestampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_enrollments"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    # The next stage the user is allowed to complete (soft sequential gating).
    current_stage = models.PositiveSmallIntegerField(default=1)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["user", "course"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} → {self.course.title}"


class CourseStageCompletion(TimestampedModel):
    enrollment = models.ForeignKey(
        CourseEnrollment, on_delete=models.CASCADE, related_name="stage_completions"
    )
    stage = models.ForeignKey(CourseStage, on_delete=models.CASCADE, related_name="completions")

    class Meta:
        unique_together = ["enrollment", "stage"]

    def __str__(self):
        return f"{self.enrollment} ✓ этап {self.stage.stage_number}"
