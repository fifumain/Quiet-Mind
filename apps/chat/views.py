from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatSession
from .serializers import ChatMessageSerializer, ChatSessionSerializer


class ChatSessionView(generics.RetrieveAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        session, _ = ChatSession.objects.get_or_create(user=self.request.user)
        return session


class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_session(self):
        session, _ = ChatSession.objects.get_or_create(user=self.request.user)
        return session

    def get_queryset(self):
        return self.get_session().messages.all()

    def perform_create(self, serializer):
        serializer.save(session=self.get_session(), role="user")


class ChatResetView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        session, _ = ChatSession.objects.get_or_create(user=request.user)
        session.messages.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
