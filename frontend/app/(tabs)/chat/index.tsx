import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Composer } from '../../../src/components/chat/Composer';
import { MessageBubble } from '../../../src/components/chat/MessageBubble';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { AssistantUnavailableError, ThrottledError } from '../../../src/api/endpoints/chat';
import { useChatMessages, useResetChat, useSendMessage } from '../../../src/hooks/useChat';
import { theme } from '../../../src/theme/theme';

export default function ChatScreen() {
  const messagesQuery = useChatMessages();
  const sendMessage = useSendMessage();
  const resetChat = useResetChat();
  const [errorText, setErrorText] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const listRef = useRef<FlatList>(null);

  const messages = messagesQuery.data ?? [];

  const handleSend = (content: string) => {
    setErrorText(null);
    sendMessage.mutate(content, {
      onError: (err) => {
        if (err instanceof ThrottledError) {
          setErrorText("You're sending messages too fast — try again in a moment.");
        } else if (err instanceof AssistantUnavailableError) {
          setErrorText(err.message);
        } else {
          setErrorText('Something went wrong sending that message.');
        }
      },
    });
  };

  const handleReset = () => {
    setConfirmingReset(false);
    resetChat.mutate();
  };

  if (messagesQuery.isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {confirmingReset ? (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>Clear entire conversation?</Text>
            <Pressable onPress={handleReset}>
              <Text style={styles.confirmYes}>Yes, clear</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmingReset(false)}>
              <Text style={styles.confirmNo}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingReset(true)}>
            <Text style={styles.resetLink}>Clear conversation</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MessageBubble message={item} />}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.list}
      />

      {errorText ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <Composer onSend={handleSend} disabled={sendMessage.isPending} sending={sendMessage.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resetLink: { color: '#c00', textDecorationLine: 'underline', fontSize: theme.fontSize.sm },
  confirmRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  confirmText: { fontSize: theme.fontSize.sm },
  confirmYes: { color: '#c00', fontWeight: '600' },
  confirmNo: { color: '#666' },
  list: { paddingVertical: theme.spacing.sm },
  errorBanner: { padding: theme.spacing.sm, backgroundColor: '#fee' },
  errorText: { color: '#900', fontSize: theme.fontSize.sm },
});
