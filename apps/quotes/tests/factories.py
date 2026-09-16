import factory

from apps.quotes.models import Author, Category, Quote


class AuthorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Author

    name = factory.Sequence(lambda n: f"Author {n}")
    bio = ""


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category
        django_get_or_create = ("slug",)

    name = factory.Sequence(lambda n: f"Category {n}")
    slug = factory.Sequence(lambda n: f"category-{n}")


class QuoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Quote
        skip_postgeneration_save = True

    text = factory.Sequence(lambda n: f"Quote text {n}")
    author = factory.SubFactory(AuthorFactory)
    source = ""

    @factory.post_generation
    def categories(self, create, extracted, **kwargs):
        if not create or not extracted:
            return
        self.categories.set(extracted)
