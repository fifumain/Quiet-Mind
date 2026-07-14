from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.quotes.urls")),
    path("api/v1/", include("apps.books.urls")),
    # api/v1/ endpoints for chat are wired in once that app is implemented.
]
