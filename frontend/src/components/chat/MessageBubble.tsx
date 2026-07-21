import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { ChatMessage } from '../../api/overrides/chat';
import { glassBlur, theme } from '../../theme/theme';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <Animated.View
      entering={FadeInUp.duration(320).springify().damping(18)}
      style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}
    >
      <View style={[styles.bubble, isUser ? styles.bubbleUser : [styles.bubbleAssistant, glassBlur(16)]]}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 5 },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: theme.radius.md, paddingVertical: 11, paddingHorizontal: 15 },
  bubbleUser: { backgroundColor: theme.glass.fillStrong, borderBottomRightRadius: 4 },
  bubbleAssistant: {
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: theme.fontSize.md, lineHeight: 22, color: theme.colors.textPrimary },
});
