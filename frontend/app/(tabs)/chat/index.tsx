import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../src/components/common/AppText';
import { AssistantUnavailableError, ThrottledError } from '../../../src/api/endpoints/chat';
import { ChatIntro } from '../../../src/components/chat/ChatIntro';
import { Composer } from '../../../src/components/chat/Composer';
import { MessageBubble } from '../../../src/components/chat/MessageBubble';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
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
          setErrorText('Too many messages in a row — try again in a minute.');
        } else if (err instanceof AssistantUnavailableError) {
          setErrorText(err.message);
        } else {
          setErrorText('Could not send the message.');
        }
      },
    });
  };

  const handleReset = () => {
    setConfirmingReset(false);
    resetChat.mutate();
  };

  return (
    <ScreenContainer title="Chat" scroll={false}>
      <View style={styles.header}>
        {confirmingReset ? (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>Clear the whole conversation?</Text>
            {/* Cancel first and the destructive action last, both on real
                44pt targets — this used to be two ~19pt text links 16px apart. */}
            <Pressable onPress={() => setConfirmingReset(false)} style={styles.confirmBtn} accessibilityRole="button">
              <Text style={styles.confirmNo}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleReset}
              style={[styles.confirmBtn, styles.confirmBtnDanger]}
              accessibilityRole="button"
            >
              <Text style={styles.confirmYes}>Yes, clear it</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingReset(true)} style={styles.resetBtn} accessibilityRole="button">
            <Text style={styles.resetLink}>Clear conversation</Text>
          </Pressable>
        )}
      </View>

      {messagesQuery.isLoading ? (
        <LoadingSpinner />
      ) : messages.length === 0 ? (
        <ChatIntro onPick={handleSend} />
      ) : (
        <FlatList
          ref={listRef}
          style={styles.thread}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MessageBubble message={item} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.threadContent}
        />
      )}

      {errorText ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <Composer onSend={handleSend} disabled={sendMessage.isPending} sending={sendMessage.isPending} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: theme.spacing.xs },
  resetBtn: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  resetLink: { color: theme.colors.danger, textDecorationLine: 'underline', fontSize: theme.fontSize.sm },
  confirmRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center', flexWrap: 'wrap' },
  confirmText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  confirmBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  confirmBtnDanger: { borderColor: theme.colors.danger },
  confirmYes: { color: theme.colors.danger, fontWeight: '600', fontSize: theme.fontSize.sm },
  confirmNo: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  thread: { flex: 1 },
  threadContent: { paddingVertical: theme.spacing.sm, flexGrow: 1 },
  errorBanner: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(232,176,160,0.18)',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  errorText: { color: theme.colors.danger, fontSize: theme.fontSize.sm },
});
