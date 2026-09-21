from rest_framework import serializers

from .models import ChatMessage, ChatSession


class ChatMessageSerializer(serializers.ModelSerializer):
    # The model field is an unbounded TextField (no DB-level reason to cap
    # it), but every user message goes straight into the Groq request — an
    # unbounded message means unbounded token spend and a bloated sliding
    # window. 4000 chars is a generous couple of paragraphs, well short of
    # anything a real chat turn needs.
    content = serializers.CharField(max_length=4000)

    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "created_at"]
        read_only_fields = ["id", "role", "created_at"]


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["created_at", "updated_at"]
