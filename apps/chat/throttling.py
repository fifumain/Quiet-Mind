from rest_framework.throttling import ScopedRateThrottle


class ChatMessageThrottle(ScopedRateThrottle):
    """Only POST (sending a message to Groq) spends quota — GET (reading history) is exempt."""

    def allow_request(self, request, view):
        if request.method != "POST":
            return True
        return super().allow_request(request, view)
