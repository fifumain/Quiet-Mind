import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Slot, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GlassBackground } from '../src/components/common/GlassBackground';
import { useAuthHydration } from '../src/hooks/useAuth';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme/theme';

function AuthGate() {
  useAuthHydration();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const pathname = usePathname();

  if (!isHydrated) {
    return (
      <GlassBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.textPrimary} />
        </View>
      </GlassBackground>
    );
  }

  // The landing page ('/') is public and viewable in any auth state — its
  // CTAs adapt. login/register are public too. Everything else needs auth.
  const inAuthGroup = pathname === '/login' || pathname === '/register';
  const isPublic = pathname === '/' || inAuthGroup;

  if (!accessToken && !isPublic) {
    return <Redirect href="/" />;
  }
  if (accessToken && inAuthGroup) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <AuthGate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
