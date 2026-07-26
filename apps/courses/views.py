from django.db.models import Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.cache import CachedListMixin, invalidate_list_cache

from .models import Course, CourseEnrollment, CourseStage, CourseStageCompletion
from .serializers import CourseDetailSerializer, CourseEnrollmentSerializer, CourseListSerializer


class CourseViewSet(CachedListMixin, viewsets.ReadOnlyModelViewSet):
    cache_model_name = "course"
    lookup_field = "slug"
    permission_classes = [AllowAny]
    queryset = (
        Course.objects.filter(is_published=True)
        .prefetch_related("categories")
        .annotate(
            stage_count=Count("stages", distinct=True),
            completions_count=Count(
                "enrollments", filter=Q(enrollments__completed_at__isnull=False), distinct=True
            ),
        )
    )

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "retrieve":
            return qs.prefetch_related(
                Prefetch(
                    "stages",
                    queryset=CourseStage.objects.select_related(
                        "quote", "quote__author", "book", "book__author"
                    ).prefetch_related("quote__categories", "book__categories"),
                )
            )
        return qs

    def get_serializer_class(self):
        return CourseListSerializer if self.action == "list" else CourseDetailSerializer


class CourseEnrollView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses=CourseEnrollmentSerializer)
    def post(self, request, slug=None):
        course = get_object_or_404(Course, slug=slug, is_published=True)
        enrollment, _ = CourseEnrollment.objects.get_or_create(user=request.user, course=course)
        return Response(CourseEnrollmentSerializer(enrollment).data)


class CourseStageCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses=CourseEnrollmentSerializer)
    def post(self, request, slug=None, stage_number=None):
        course = get_object_or_404(Course, slug=slug, is_published=True)
        stage = get_object_or_404(CourseStage, course=course, stage_number=stage_number)

        try:
            enrollment = CourseEnrollment.objects.get(user=request.user, course=course)
        except CourseEnrollment.DoesNotExist:
            return Response({"detail": "Enroll in the course first."}, status=400)

        # Sequential soft-gating: content is always readable, but you can't mark a
        # stage complete before the ones before it.
        if stage.stage_number > enrollment.current_stage:
            return Response({"detail": "Complete the previous stage first."}, status=400)

        CourseStageCompletion.objects.get_or_create(enrollment=enrollment, stage=stage)
        enrollment.current_stage = max(enrollment.current_stage, stage.stage_number + 1)
        newly_completed = False
        if stage.stage_number == course.stages.count() and enrollment.completed_at is None:
            enrollment.completed_at = timezone.now()
            newly_completed = True
        enrollment.save(update_fields=["current_stage", "completed_at", "updated_at"])

        # completions_count feeds the public "popularity" sort in the cached
        # course list, so refresh that cache the moment a course is completed.
        if newly_completed:
            invalidate_list_cache("course")

        return Response(CourseEnrollmentSerializer(enrollment).data)


class MyCourseProgressView(generics.ListAPIView):
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            CourseEnrollment.objects.filter(user=self.request.user)
            .select_related("course")
            .prefetch_related("course__categories", "stage_completions__stage")
            .order_by("-created_at")
        )
