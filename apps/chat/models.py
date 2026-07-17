from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class ChatSession(TimestampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_session"
    )
    summary = models.TextField(blank=True, default="")

    def __str__(self):
        return f"Chat session for {self.user}"


class ChatMessage(TimestampedModel):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=16, choices=[("user", "user"), ("assistant", "assistant")])
    content = models.TextField()

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["session", "created_at"])]

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
