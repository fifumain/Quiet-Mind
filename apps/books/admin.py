from django.contrib import admin

from .models import Book, FeaturedBook


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "publication_year"]
    list_select_related = ["author"]
    search_fields = ["title", "author__name", "description"]
    list_filter = ["categories"]
    autocomplete_fields = ["author"]
    filter_horizontal = ["categories"]


@admin.register(FeaturedBook)
class FeaturedBookAdmin(admin.ModelAdmin):
    list_display = ["week_start", "book"]
    list_select_related = ["book"]
    date_hierarchy = "week_start"
    autocomplete_fields = ["book"]
