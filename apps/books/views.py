from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.cache import CachedListMixin

from .filters import BookFilter
from .models import Book, FeaturedBook
from .serializers import BookSerializer, FeaturedBookSerializer


class BookViewSet(CachedListMixin, viewsets.ReadOnlyModelViewSet):
    cache_model_name = "book"
    queryset = Book.objects.select_related("author").prefetch_related("categories")
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = BookFilter
    search_fields = ["title", "description", "author__name"]


class FeaturedBookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        FeaturedBook.objects.select_related("book", "book__author")
        .prefetch_related("book__categories")
        .order_by("-week_start")
    )
    serializer_class = FeaturedBookSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def current(self, request):
        featured = self.get_queryset().filter(week_start__lte=timezone.localdate()).first()
        if featured is None:
            return Response({"detail": "No featured book set yet."}, status=404)
        return Response(self.get_serializer(featured).data)
