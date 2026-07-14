from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
    # api/v1/ endpoints (auth, quotes, chat) are wired in as each app is implemented.
]
