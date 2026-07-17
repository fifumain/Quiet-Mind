from rest_framework.routers import DefaultRouter

from .views import AuthorViewSet, CategoryViewSet, QuoteOfTheDayViewSet, QuoteViewSet

router = DefaultRouter()
router.register("quotes", QuoteViewSet, basename="quote")
router.register("authors", AuthorViewSet, basename="author")
router.register("categories", CategoryViewSet, basename="category")
router.register("quote-of-the-day", QuoteOfTheDayViewSet, basename="quote-of-the-day")

urlpatterns = router.urls
