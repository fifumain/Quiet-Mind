import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SpecularButton } from '../common/SpecularButton';
import { glassBlur, theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { label: 'Features', target: 'features' },
  { label: 'Screens', target: 'screens' },
  { label: 'Topics', target: 'topics' },
] as const;

function scrollToSection(id: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function TopBar() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <View style={[styles.bar, glassBlur(20), stickyStyle]}>
      <View style={styles.inner}>
        <Text style={styles.brand}>Alex</Text>

        <View style={styles.links}>
          {NAV.map((item) => (
            <Pressable key={item.target} onPress={() => scrollToSection(item.target)}>
              <Text style={styles.link}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          {accessToken ? (
            <SpecularButton style={styles.cta} onPress={() => router.navigate('/(tabs)/today')} radius={theme.radius.sm}>
              <Text style={styles.ctaText}>Open the app</Text>
            </SpecularButton>
          ) : (
            <>
              <Pressable onPress={() => router.navigate('/login')} style={styles.ghost}>
                <Text style={styles.ghostText}>Log in</Text>
              </Pressable>
              <SpecularButton style={styles.cta} onPress={() => router.navigate('/register')} radius={theme.radius.sm}>
                <Text style={styles.ctaText}>Get started</Text>
              </SpecularButton>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const stickyStyle =
  Platform.OS === 'web'
    ? ({ position: 'sticky', top: 0, zIndex: 100 } as unknown as object)
    : {};

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: theme.glass.border,
    backgroundColor: theme.glass.fillSubtle,
  },
  inner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  brand: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: '700' },
  links: { flexDirection: 'row', gap: theme.spacing.lg },
  link: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  ghost: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  ghostText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '600' },
  cta: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  ctaText: { color: theme.gradient[0], fontSize: theme.fontSize.sm, fontWeight: '700' },
});
