import { StyleSheet, View, type TextStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedTextProps {
  text: string;
  style?: TextStyle;
  delay?: number;
  stagger?: number;
}

/**
 * Word-by-word reveal (fade + rise), inspired by reactbits.dev's "Split Text" /
 * "Blur Text". The original is GSAP + a DOM splitter; this does the same beat
 * with reanimated's declarative `entering`, so it runs on web and native alike.
 * Words wrap naturally because each sits in its own inline-ish flex item.
 */
export function AnimatedText({ text, style, delay = 0, stagger = 70 }: AnimatedTextProps) {
  const words = text.split(' ');
  return (
    <View style={styles.row}>
      {words.map((word, i) => (
        <Animated.Text
          key={`${word}-${i}`}
          entering={FadeInDown.delay(delay + i * stagger)
            .duration(520)
            .springify()
            .damping(18)}
          style={style}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
