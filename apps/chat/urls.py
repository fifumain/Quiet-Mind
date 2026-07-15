from django.urls import path

from .views import ChatMessageListCreateView, ChatResetView, ChatSessionView

urlpatterns = [
    path("chat/session/", ChatSessionView.as_view(), name="chat-session"),
    path("chat/session/messages/", ChatMessageListCreateView.as_view(), name="chat-messages"),
    path("chat/session/reset/", ChatResetView.as_view(), name="chat-reset"),
]
