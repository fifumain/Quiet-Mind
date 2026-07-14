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
