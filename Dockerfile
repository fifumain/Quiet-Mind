FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/ requirements/
ARG REQUIREMENTS_FILE=requirements/dev.txt
RUN pip install --no-cache-dir -r ${REQUIREMENTS_FILE}

COPY . .

# collectstatic doesn't touch the DB or care about secrets, but config.settings.prod
# fails fast on a missing/insecure SECRET_KEY and unset ALLOWED_HOSTS — neither of
# which is available at build time — and config.settings.dev pulls in corsheaders,
# which isn't installed when building with requirements/prod.txt. base.py has
# neither problem (safe SECRET_KEY default, no dev-only apps), so build against it.
RUN DJANGO_SETTINGS_MODULE=config.settings.base python manage.py collectstatic --noinput

EXPOSE 8000

# gunicorn is the image's default — production-correct out of the box. Local dev
# overrides this back to `runserver` via docker-compose.yml's `command:` (same
# pattern already used there to run celery instead of the default CMD).
#
# --timeout 60, not gunicorn's default 30: the chat endpoint waits synchronously on
# Groq, and the worst case (apps/chat/services/groq_client.py's retry loop across
# up to MAX_TOOL_ROUNDS+1 completions) can legitimately run past 30s — the default
# would kill the worker mid-request and surface as an intermittent, hard-to-explain
# 502 in production instead of just a slow-but-successful reply.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", \
     "--workers", "3", "--timeout", "60", \
     "--access-logfile", "-", "--error-logfile", "-"]
