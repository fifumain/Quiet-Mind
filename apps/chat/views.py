from django.core.cache import cache
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, ChatSession
from .serializers import ChatMessageSerializer, ChatSessionSerializer
from .services import conversation
from .throttling import ChatMessageThrottle


class ChatSessionView(generics.RetrieveAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        session, _ = ChatSession.objects.get_or_create(user=self.request.user)
        return session


class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [ChatMessageThrottle]
    throttle_scope = "chat_message"

    def get_session(self):
        session, _ = ChatSession.objects.get_or_create(user=self.request.user)
        return session

    def get_queryset(self):
        return self.get_session().messages.all()

    def perform_create(self, serializer):
        serializer.save(session=self.get_session(), role="user")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = self.get_session()

        # Cache the message before it's persisted: get_cached_context() falls
        # back to reading the DB on a cache miss, and if the message were
        # saved first, that fallback would already include it — causing
        # append_and_cache() to append a second, duplicate copy on top.
        conversation.append_and_cache(session.id, "user", serializer.validated_data["content"])

        self.perform_create(serializer)
        user_message = serializer.instance
        session.refresh_from_db(fields=["summary"])

        try:
            assistant_text = conversation.get_assistant_reply(session)
        except conversation.GroqUnavailableError:
            return Response(
                {"detail": "Alex is having trouble replying right now. Please try again in a moment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        assistant_message = ChatMessage.objects.create(session=session, role="assistant", content=assistant_text)
        conversation.append_and_cache(session.id, "assistant", assistant_text)

        return Response(
            {
                "user_message": ChatMessageSerializer(user_message).data,
                "assistant_message": ChatMessageSerializer(assistant_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ChatResetView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        session, _ = ChatSession.objects.get_or_create(user=request.user)
        session.messages.all().delete()
        cache.delete(f"chat:context:{session.id}")
        ChatSession.objects.filter(id=session.id).update(summary="")
        return Response(status=status.HTTP_204_NO_CONTENT)
