from pathlib import Path

from django.http import HttpResponse

_HTML_PATH = Path(__file__).resolve().parent / "devtools" / "test_console.html"


def test_console(request):
    """Dev-only, same-origin test console for exercising the API by hand.

    Not part of the product (this project is API-first, no server templates) —
    just a throwaway tool so the API can be clicked through in a real browser
    without CORS/mixed-content issues. Only wired up when DEBUG=True.
    """
    return HttpResponse(_HTML_PATH.read_text(encoding="utf-8"), content_type="text/html; charset=utf-8")
