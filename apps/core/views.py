from django.http import JsonResponse


def healthz(request):
    """Liveness check for EC2/ALB — deliberately doesn't touch the DB or cache,
    so a transient Postgres/Redis hiccup doesn't flap this process's own health
    status along with it."""
    return JsonResponse({"status": "ok", "deploy_check": "autodeploy-1"})
