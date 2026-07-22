from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import filters, generics, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.cache import CachedListMixin

from .filters import BookFilter
from .models import Book, FavoriteBook, FeaturedBook
from .serializers import BookSerializer, FavoriteBookSerializer, FeaturedBookSerializer


class BookViewSet(CachedListMixin, viewsets.ReadOnlyModelViewSet):
    cache_model_name = "book"
    queryset = Book.objects.select_related("author").prefetch_related("categories")
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = BookFilter
    search_fields = ["title", "description", "author__name"]

    @extend_schema(
        request=None,
        responses={200: inline_serializer("FavoriteBookToggle", {"is_favorited": serializers.BooleanField()})},
    )
    @action(detail=True, methods=["post", "delete"], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        book = self.get_object()
        if request.method == "POST":
            FavoriteBook.objects.get_or_create(user=request.user, book=book)
            return Response({"is_favorited": True})
        FavoriteBook.objects.filter(user=request.user, book=book).delete()
        return Response({"is_favorited": False})


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


class FavoriteBookIdsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: inline_serializer(
                "FavoriteBookIds", {"book_ids": serializers.ListField(child=serializers.IntegerField())}
            )
        },
    )
    def get(self, request):
        book_ids = list(FavoriteBook.objects.filter(user=request.user).values_list("book_id", flat=True))
        return Response({"book_ids": book_ids})


class FavoriteBookListView(generics.ListAPIView):
    serializer_class = FavoriteBookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            FavoriteBook.objects.filter(user=self.request.user)
            .select_related("book", "book__author")
            .prefetch_related("book__categories")
            .order_by("-created_at")
        )
