import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './generated/schema';
import { API_BASE_URL } from '../lib/config';
import { tokenStorage } from '../lib/secureStorage';
import { useAuthStore } from '../store/authStore';

const client = createClient<paths>({ baseUrl: API_BASE_URL });

// Deduplicates concurrent 401s into a single refresh call instead of firing
// one refresh request per in-flight request.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!response.ok) return false;

  const data = (await response.json()) as { access: string; refresh: string };
  useAuthStore.getState().setTokens(data.access, data.refresh);
  await tokenStorage.setItem('accessToken', data.access);
  await tokenStorage.setItem('refreshToken', data.refresh);
  return true;
}

async function clearAuth() {
  useAuthStore.getState().clear();
  await tokenStorage.deleteItem('accessToken');
  await tokenStorage.deleteItem('refreshToken');
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return request;
  },
  async onResponse({ request, response }) {
    if (response.status !== 401) return response;

    refreshPromise ??= refreshTokens().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;

    if (!refreshed) {
      await clearAuth();
      return response;
    }

    const { accessToken } = useAuthStore.getState();
    const retryRequest = request.clone();
    retryRequest.headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(retryRequest);
  },
};

client.use(authMiddleware);

export { client };
