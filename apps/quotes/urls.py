from rest_framework.routers import DefaultRouter

from .views import AuthorViewSet, CategoryViewSet, QuoteViewSet

router = DefaultRouter()
router.register("quotes", QuoteViewSet, basename="quote")
router.register("authors", AuthorViewSet, basename="author")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = router.urls
