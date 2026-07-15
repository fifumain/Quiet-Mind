from django.apps import AppConfig


class QuotesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.quotes"

    def ready(self):
        from . import signals  # noqa: F401
