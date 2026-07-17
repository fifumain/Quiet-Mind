from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.cache import CachedListMixin

from .filters import QuoteFilter
from .models import Author, Category, Quote, QuoteOfTheDay
from .serializers import (
    AuthorSerializer,
    CategorySerializer,
    QuoteOfTheDaySerializer,
    QuoteSerializer,
)


class AuthorViewSet(CachedListMixin, viewsets.ReadOnlyModelViewSet):
    cache_model_name = "author"
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [AllowAny]


class CategoryViewSet(CachedListMixin, viewsets.ReadOnlyModelViewSet):
    cache_model_name = "category"
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class QuoteViewSet(CachedListMixin, viewsets.ReadOnlyModelViewSet):
    cache_model_name = "quote"
    queryset = Quote.objects.select_related("author").prefetch_related("categories")
    serializer_class = QuoteSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = QuoteFilter
    search_fields = ["text", "author__name"]


class QuoteOfTheDayViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        QuoteOfTheDay.objects.select_related("quote", "quote__author")
        .prefetch_related("quote__categories")
        .order_by("-day")
    )
    serializer_class = QuoteOfTheDaySerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def current(self, request):
        featured = self.get_queryset().filter(day__lte=timezone.localdate()).first()
        if featured is None:
            return Response({"detail": "No quote of the day set yet."}, status=404)
        return Response(self.get_serializer(featured).data)
