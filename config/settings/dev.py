from .base import *  # noqa: F403

DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = INSTALLED_APPS + ["corsheaders"]  # noqa: F405

MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware"] + MIDDLEWARE  # noqa: F405

# Dev-only: lets a browser-based test UI (e.g. a Claude Artifact) call this
# API directly from a different origin. Never enabled in prod.py.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_PRIVATE_NETWORK = True
