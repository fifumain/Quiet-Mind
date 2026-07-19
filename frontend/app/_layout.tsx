import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Slot, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthHydration } from '../src/hooks/useAuth';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/store/authStore';

function AuthGate() {
  useAuthHydration();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const pathname = usePathname();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const inAuthGroup = pathname === '/login' || pathname === '/register';

  if (!accessToken && !inAuthGroup) {
    return <Redirect href="/login" />;
  }
  if (accessToken && inAuthGroup) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
