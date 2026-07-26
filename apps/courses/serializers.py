from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.books.serializers import BookSerializer
from apps.quotes.serializers import CategorySerializer, QuoteSerializer

from .models import Course, CourseEnrollment, CourseStage


class CourseListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    stage_count = serializers.SerializerMethodField()
    completions_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "title", "slug", "teaser", "cover_image", "categories", "stage_count", "completions_count"]

    @extend_schema_field(OpenApiTypes.INT)
    def get_stage_count(self, obj):
        # Uses the annotation from CourseViewSet when present; falls back to a
        # count so the serializer also works for the (unannotated) course nested
        # inside an enrollment.
        value = getattr(obj, "stage_count", None)
        return value if value is not None else obj.stages.count()

    @extend_schema_field(OpenApiTypes.INT)
    def get_completions_count(self, obj):
        value = getattr(obj, "completions_count", None)
        return value if value is not None else obj.enrollments.filter(completed_at__isnull=False).count()


class CourseStageSerializer(serializers.ModelSerializer):
    quote = QuoteSerializer(read_only=True)
    book = BookSerializer(read_only=True)

    class Meta:
        model = CourseStage
        fields = ["stage_number", "title", "body", "reflection_prompt", "quote", "book"]


class CourseDetailSerializer(CourseListSerializer):
    stages = CourseStageSerializer(many=True, read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ["description", "stages"]


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    completed_stage_numbers = serializers.SerializerMethodField()

    class Meta:
        model = CourseEnrollment
        fields = ["course", "current_stage", "completed_at", "completed_stage_numbers"]

    @extend_schema_field(serializers.ListSerializer(child=serializers.IntegerField()))
    def get_completed_stage_numbers(self, obj):
        return list(obj.stage_completions.values_list("stage__stage_number", flat=True))
