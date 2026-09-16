import factory

from apps.chat.models import ChatMessage, ChatSession
from apps.core.tests.factories import UserFactory


class ChatSessionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ChatSession

    user = factory.SubFactory(UserFactory)
    summary = ""


class ChatMessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ChatMessage

    session = factory.SubFactory(ChatSessionFactory)
    role = "user"
    content = factory.Sequence(lambda n: f"Message {n}")
