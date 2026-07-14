from django.contrib import admin

from .models import Author, Category, Quote


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ["short_text", "author", "source"]
    list_select_related = ["author"]
    search_fields = ["text", "author__name", "source"]
    list_filter = ["categories"]
    autocomplete_fields = ["author"]
    filter_horizontal = ["categories"]

    @admin.display(description="Text")
    def short_text(self, obj):
        return obj.text[:80]
