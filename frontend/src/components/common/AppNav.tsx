import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { glassBlur, theme } from '../../theme/theme';

const ITEMS = [
  { label: 'Сегодня', path: '/today' },
  { label: 'Чат', path: '/chat' },
  { label: 'Библиотека', path: '/library' },
] as const;

export function AppNav({ variant }: { variant: 'sidebar' | 'bottom' }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSidebar = variant === 'sidebar';

  return (
    <View style={[isSidebar ? styles.sidebar : styles.bottom, glassBlur()]}>
      {isSidebar ? <Text style={styles.brand}>Alex</Text> : null}
      <View style={isSidebar ? styles.navColumn : styles.navRow}>
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.path);
          return (
            <Pressable
              key={item.path}
              onPress={() => router.navigate(item.path)}
              style={[
                isSidebar ? styles.itemSidebar : styles.itemBottom,
                active && (isSidebar ? styles.itemSidebarActive : undefined),
              ]}
            >
              <View style={[styles.dot, active && styles.dotActive]} />
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.glass.fillSubtle,
    borderRightWidth: 1,
    borderRightColor: theme.glass.border,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.glass.fillSubtle,
    borderTopWidth: 1,
    borderTopColor: theme.glass.border,
  },
  brand: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.xl,
    paddingLeft: theme.spacing.sm,
  },
  navColumn: { gap: theme.spacing.xs },
  navRow: { flexDirection: 'row', flex: 1, justifyContent: 'space-around' },
  itemSidebar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
  },
  itemSidebarActive: { backgroundColor: theme.glass.fill },
  itemBottom: { alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(245,246,240,0.3)' },
  dotActive: { backgroundColor: theme.colors.accent },
  label: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, fontWeight: '600' },
  labelActive: { color: theme.colors.textPrimary },
});
