from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import filters, generics, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.cache import CachedListMixin

from .filters import QuoteFilter
from .models import Author, Category, FavoriteQuote, Quote, QuoteOfTheDay
from .serializers import (
    AuthorSerializer,
    CategorySerializer,
    FavoriteQuoteSerializer,
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

    @extend_schema(
        request=None,
        responses={200: inline_serializer("FavoriteQuoteToggle", {"is_favorited": serializers.BooleanField()})},
    )
    @action(detail=True, methods=["post", "delete"], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        quote = self.get_object()
        if request.method == "POST":
            FavoriteQuote.objects.get_or_create(user=request.user, quote=quote)
            return Response({"is_favorited": True})
        FavoriteQuote.objects.filter(user=request.user, quote=quote).delete()
        return Response({"is_favorited": False})


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


class FavoriteQuoteIdsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: inline_serializer(
                "FavoriteQuoteIds", {"quote_ids": serializers.ListField(child=serializers.IntegerField())}
            )
        },
    )
    def get(self, request):
        quote_ids = list(FavoriteQuote.objects.filter(user=request.user).values_list("quote_id", flat=True))
        return Response({"quote_ids": quote_ids})


class FavoriteQuoteListView(generics.ListAPIView):
    serializer_class = FavoriteQuoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            FavoriteQuote.objects.filter(user=self.request.user)
            .select_related("quote", "quote__author")
            .prefetch_related("quote__categories")
            .order_by("-created_at")
        )
