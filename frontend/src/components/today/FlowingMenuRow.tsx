import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { theme } from '../../theme/theme';

/**
 * Not imported from the `lucide-react-native` package root — this project
 * always imports icons from their deep path (`lucide-react-native/icons/x`)
 * because Metro doesn't tree-shake the root barrel export, so there's no
 * `LucideIcon` type to import alongside them either. This is the minimal
 * shape every deep icon import satisfies.
 */
export type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export interface FlowingMenuRowProps {
  label: string;
  Icon: IconComponent;
  onPress: () => void;
}

/**
 * Native fallback for the flowing-menu row — see FlowingMenuRow.web.tsx for
 * the hover-triggered marquee reveal. There is no hover concept on native, so
 * this is just the plain pressable row underneath it: label, icon, tap to go.
 */
export function FlowingMenuRow({ label, Icon, onPress }: FlowingMenuRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconWrap}>
        <Icon size={20} color={theme.colors.textPrimary} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.glass.border,
  },
  label: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.textPrimary },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
});
