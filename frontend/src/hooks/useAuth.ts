import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as authApi from '../api/endpoints/auth';
import { tokenStorage } from '../lib/secureStorage';
import { useAuthStore } from '../store/authStore';

/** Reads persisted tokens once on app boot and marks the store hydrated. */
export function useAuthHydration() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [accessToken, refreshToken] = await Promise.all([
        tokenStorage.getItem('accessToken'),
        tokenStorage.getItem('refreshToken'),
      ]);
      if (cancelled) return;
      if (accessToken && refreshToken) setTokens(accessToken, refreshToken);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setTokens, setHydrated]);
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh);
      await Promise.all([
        tokenStorage.setItem('accessToken', data.access),
        tokenStorage.setItem('refreshToken', data.refresh),
      ]);
    },
  });
}

export function useRegister() {
  const login = useLogin();

  return useMutation({
    mutationFn: async (input: authApi.RegisterInput) => {
      await authApi.register(input);
      // Register doesn't return tokens itself — log in immediately after.
      return login.mutateAsync({ username: input.username, password: input.password });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        // Best-effort — proceed with local logout even if this fails (e.g. offline).
        await authApi.blacklistRefreshToken(refreshToken).catch(() => undefined);
      }
    },
    onSettled: async () => {
      clear();
      await Promise.all([tokenStorage.deleteItem('accessToken'), tokenStorage.deleteItem('refreshToken')]);
      queryClient.clear();
    },
  });
}
