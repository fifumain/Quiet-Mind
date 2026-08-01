import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './AppText';
import { ClickSpark } from './ClickSpark';
import { theme } from '../../theme/theme';

interface HeartButtonProps {
  isFavorited: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Small heart toggle with a tap-spark burst — reuses ClickSpark's particle effect for delight on favorite/unfavorite. */
export function HeartButton({ isFavorited, onPress, style }: HeartButtonProps) {
  return (
    <ClickSpark style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.icon, isFavorited && styles.iconActive]}>{isFavorited ? '♥' : '♡'}</Text>
    </ClickSpark>
  );
}

const styles = StyleSheet.create({
  button: { padding: theme.spacing.xs },
  icon: { fontSize: 20, color: theme.colors.textMuted },
  iconActive: { color: theme.colors.danger },
});
