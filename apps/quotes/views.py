from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from apps.core.cache import CachedListMixin

from .filters import QuoteFilter
from .models import Author, Category, Quote
from .serializers import AuthorSerializer, CategorySerializer, QuoteSerializer


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
