from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class Author(TimestampedModel):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(TimestampedModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Quote(TimestampedModel):
    text = models.TextField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="quotes")
    categories = models.ManyToManyField(Category, related_name="quotes", blank=True)
    source = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.text[:50]} — {self.author.name}"


class QuoteOfTheDay(TimestampedModel):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name="featured_history")
    day = models.DateField(unique=True)

    class Meta:
        ordering = ["-day"]

    def __str__(self):
        return f"{self.day}: {self.quote.text[:40]}"


class FavoriteQuote(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorite_quotes")
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name="favorited_by")

    class Meta:
        unique_together = ["user", "quote"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} ♥ {self.quote.text[:40]}"
