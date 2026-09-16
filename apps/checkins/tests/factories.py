import factory
from django.utils import timezone

from apps.checkins.models import MoodCheckIn
from apps.core.tests.factories import UserFactory


class MoodCheckInFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MoodCheckIn

    user = factory.SubFactory(UserFactory)
    date = factory.LazyFunction(timezone.localdate)
    mood = "okay"
    note = ""
