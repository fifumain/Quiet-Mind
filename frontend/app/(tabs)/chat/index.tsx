import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AssistantUnavailableError, ThrottledError } from '../../../src/api/endpoints/chat';
import { Composer } from '../../../src/components/chat/Composer';
import { MessageBubble } from '../../../src/components/chat/MessageBubble';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { RotatingText } from '../../../src/components/common/RotatingText';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { useChatMessages, useResetChat, useSendMessage } from '../../../src/hooks/useChat';
import { theme } from '../../../src/theme/theme';

const EMPTY_PROMPTS = [
  'Расскажите, что вас беспокоит.',
  'Как прошёл ваш день?',
  'Что сейчас занимает ваши мысли?',
  'С чего хотите начать разговор?',
];

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
          setErrorText('Слишком много сообщений подряд — попробуйте через минуту.');
        } else if (err instanceof AssistantUnavailableError) {
          setErrorText(err.message);
        } else {
          setErrorText('Не удалось отправить сообщение.');
        }
      },
    });
  };

  const handleReset = () => {
    setConfirmingReset(false);
    resetChat.mutate();
  };

  return (
    <ScreenContainer title="Чат" scroll={false}>
      <View style={styles.header}>
        {confirmingReset ? (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>Очистить весь диалог?</Text>
            <Pressable onPress={handleReset}>
              <Text style={styles.confirmYes}>Да, очистить</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmingReset(false)}>
              <Text style={styles.confirmNo}>Отмена</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingReset(true)}>
            <Text style={styles.resetLink}>Очистить диалог</Text>
          </Pressable>
        )}
      </View>

      {messagesQuery.isLoading ? (
        <LoadingSpinner />
      ) : messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <RotatingText phrases={EMPTY_PROMPTS} style={styles.emptyText} />
        </View>
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
  resetLink: { color: theme.colors.danger, textDecorationLine: 'underline', fontSize: theme.fontSize.sm },
  confirmRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  confirmText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  confirmYes: { color: theme.colors.danger, fontWeight: '600', fontSize: theme.fontSize.sm },
  confirmNo: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm },
  thread: { flex: 1 },
  threadContent: { paddingVertical: theme.spacing.sm, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  errorBanner: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(232,176,160,0.18)',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  errorText: { color: theme.colors.danger, fontSize: theme.fontSize.sm },
});
