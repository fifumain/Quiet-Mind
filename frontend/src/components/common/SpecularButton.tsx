import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { GlowBorder } from './GlowBorder';

interface SpecularButtonProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

// Native fallback — no persistent pointer for the rim-light to steer
// toward, so this reuses the pulsing halo (GlowBorder) as the touch-
// friendly analog instead of SpecularButton.web.tsx's WebGL rim light.
export function SpecularButton({ children, onPress, disabled, style, radius }: SpecularButtonProps) {
  return (
    <GlowBorder active={!disabled} radius={radius}>
      <Pressable onPress={onPress} disabled={disabled} style={style}>
        {children}
      </Pressable>
    </GlowBorder>
  );
}
