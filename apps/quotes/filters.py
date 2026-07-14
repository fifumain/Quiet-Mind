import django_filters

from .models import Quote


class QuoteFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="categories__slug", lookup_expr="iexact")
    author = django_filters.NumberFilter(field_name="author_id")

    class Meta:
        model = Quote
        fields = ["category", "author"]
