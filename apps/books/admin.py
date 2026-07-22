from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Book, FavoriteBook, FeaturedBook


@admin.register(Book)
class BookAdmin(ModelAdmin):
    list_display = ["title", "author", "publication_year"]
    list_select_related = ["author"]
    search_fields = ["title", "author__name", "description"]
    list_filter = ["categories"]
    autocomplete_fields = ["author"]
    filter_horizontal = ["categories"]


@admin.register(FeaturedBook)
class FeaturedBookAdmin(ModelAdmin):
    list_display = ["week_start", "book"]
    list_select_related = ["book"]
    date_hierarchy = "week_start"
    autocomplete_fields = ["book"]


@admin.register(FavoriteBook)
class FavoriteBookAdmin(ModelAdmin):
    list_display = ["user", "book", "created_at"]
    list_select_related = ["user", "book"]
    autocomplete_fields = ["user", "book"]
