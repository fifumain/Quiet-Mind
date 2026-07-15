from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import ChatMessage, ChatSession


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ["role", "content", "created_at"]
    can_delete = False


@admin.register(ChatSession)
class ChatSessionAdmin(ModelAdmin):
    list_display = ["user", "created_at", "updated_at"]
    search_fields = ["user__username", "user__email"]
    inlines = [ChatMessageInline]
