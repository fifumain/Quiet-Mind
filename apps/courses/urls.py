from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CourseEnrollView, CourseStageCompleteView, CourseViewSet, MyCourseProgressView

router = DefaultRouter()
router.register("courses", CourseViewSet, basename="course")

# The literal "courses/my-progress/" must be resolved BEFORE the router's
# "courses/<slug>/" detail route, otherwise "my-progress" is captured as a slug.
urlpatterns = (
    [path("courses/my-progress/", MyCourseProgressView.as_view(), name="course-my-progress")]
    + router.urls
    + [
        path("courses/<slug:slug>/enroll/", CourseEnrollView.as_view(), name="course-enroll"),
        path(
            "courses/<slug:slug>/stages/<int:stage_number>/complete/",
            CourseStageCompleteView.as_view(),
            name="course-stage-complete",
        ),
    ]
)
