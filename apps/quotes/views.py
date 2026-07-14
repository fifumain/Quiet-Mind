from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from .filters import QuoteFilter
from .models import Author, Category, Quote
from .serializers import AuthorSerializer, CategorySerializer, QuoteSerializer


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [AllowAny]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class QuoteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quote.objects.select_related("author").prefetch_related("categories")
    serializer_class = QuoteSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = QuoteFilter
    search_fields = ["text", "author__name"]
