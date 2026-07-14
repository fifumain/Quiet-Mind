from rest_framework import serializers

from apps.quotes.serializers import AuthorSerializer, CategorySerializer

from .models import Book, FeaturedBook


class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            "id", "title", "author", "categories", "description",
            "cover_image", "external_url", "publication_year",
        ]


class FeaturedBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = FeaturedBook
        fields = ["week_start", "book"]
