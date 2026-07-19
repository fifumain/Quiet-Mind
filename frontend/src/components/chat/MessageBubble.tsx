import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../../api/overrides/chat';
import { theme } from '../../theme/theme';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={isUser ? styles.textUser : styles.textAssistant}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: theme.radius.md, padding: theme.spacing.sm },
  bubbleUser: { backgroundColor: '#333' },
  bubbleAssistant: { backgroundColor: '#eee' },
  textUser: { color: '#fff', fontSize: theme.fontSize.md },
  textAssistant: { color: '#111', fontSize: theme.fontSize.md },
});
