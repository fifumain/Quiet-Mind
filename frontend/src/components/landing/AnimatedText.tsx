import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
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

  /**
   * Clip box for the rise.
   *
   * Each word enters translated ~25px downwards, and at hero sizes the line
   * below sits closer than that — so mid-animation the words were drawn on top
   * of the next line. Clipping the overflow turns the same motion into a mask
   * reveal instead. The padding is descender room (Lora's `p`, `y`, `g`) and the
   * matching negative margin keeps it out of the layout.
   */
  const fontSize = (StyleSheet.flatten(style) as TextStyle | undefined)?.fontSize;
  const descender = Math.round((typeof fontSize === 'number' ? fontSize : 24) * 0.16);

  return (
    <View style={[styles.row, { overflow: 'hidden', paddingBottom: descender, marginBottom: -descender }]}>
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
  // Centred, because every caller so far is a centred hero line: without it a
  // headline that wraps to two lines sets the second line hard left.
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
