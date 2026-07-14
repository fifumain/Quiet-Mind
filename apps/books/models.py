from django.db import models

from apps.core.models import TimestampedModel
from apps.quotes.models import Author, Category


class Book(TimestampedModel):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="books")
    description = models.TextField(blank=True)
    categories = models.ManyToManyField(Category, related_name="books", blank=True)
    cover_image = models.URLField(blank=True)
    external_url = models.URLField(blank=True)
    publication_year = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} — {self.author.name}"


class FeaturedBook(TimestampedModel):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="featured_history")
    week_start = models.DateField(unique=True)

    class Meta:
        ordering = ["-week_start"]

    def __str__(self):
        return f"{self.week_start}: {self.book.title}"
