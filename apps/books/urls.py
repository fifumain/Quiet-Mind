from rest_framework.routers import DefaultRouter

from .views import BookViewSet, FeaturedBookViewSet

router = DefaultRouter()
router.register("books", BookViewSet, basename="book")
router.register("featured-books", FeaturedBookViewSet, basename="featured-book")

urlpatterns = router.urls
