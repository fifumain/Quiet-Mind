from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    # Registration is anonymous, so it only ever got the generic 120/minute
    # anon throttle — plenty for browsing content, but nowhere near tight
    # enough to stop scripted mass account creation (which would otherwise
    # be a free way to route around any future per-user quota).
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"


class AccountDeleteView(APIView):
    """Deletes the requesting user's account outright.

    Every user-owned model (ChatSession, MoodCheckIn, FavoriteQuote, and
    simplejwt's own OutstandingToken/BlacklistedToken) has `on_delete=CASCADE`
    on its `user` FK, so this single delete removes the account and all of
    its chat history, mood check-ins, favorites, and refresh tokens together.
    No separate cleanup step needed.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
