from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, FavoriteBookIdsView, FavoriteBookListView, FeaturedBookViewSet

router = DefaultRouter()
router.register("books", BookViewSet, basename="book")
router.register("featured-books", FeaturedBookViewSet, basename="featured-book")

urlpatterns = router.urls + [
    path("favorites/books/ids/", FavoriteBookIdsView.as_view(), name="favorite-book-ids"),
    path("favorites/books/", FavoriteBookListView.as_view(), name="favorite-book-list"),
]
