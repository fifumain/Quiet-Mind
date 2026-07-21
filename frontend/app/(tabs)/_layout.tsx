import { Slot } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { AppNav } from '../../src/components/common/AppNav';
import { GlassBackground } from '../../src/components/common/GlassBackground';

const WIDE_BREAKPOINT = 800;

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  return (
    <GlassBackground>
      <View style={{ flex: 1, flexDirection: isWide ? 'row' : 'column' }}>
        {isWide ? <AppNav variant="sidebar" /> : null}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        {isWide ? null : <AppNav variant="bottom" />}
      </View>
    </GlassBackground>
  );
}
