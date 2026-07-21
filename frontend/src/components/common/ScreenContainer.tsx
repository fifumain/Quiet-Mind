import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

interface ScreenContainerProps {
  title?: string;
  children: ReactNode;
  scroll?: boolean;
}

/** Page shell: safe-area padding, optional title, transparent over the gradient. */
export function ScreenContainer({ title, children, scroll = true }: ScreenContainerProps) {
  const body = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
});
