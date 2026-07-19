import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../../theme/theme';

interface ComposerProps {
  onSend: (content: string) => void;
  disabled: boolean;
  sending: boolean;
}

export function Composer({ onSend, disabled, sending }: ComposerProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Message Alex..."
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        onKeyPress={
          // Multiline TextInput never fires onSubmitEditing on web (Enter just
          // inserts a newline there, unlike native) — submit on plain Enter,
          // let Shift+Enter through for an actual newline.
          Platform.OS === 'web'
            ? (event) => {
                const nativeEvent = event.nativeEvent as unknown as { key: string; shiftKey?: boolean };
                if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }
            : undefined
        }
        editable={!disabled}
        multiline
      />
      <Pressable style={styles.sendButton} onPress={submit} disabled={disabled || !value.trim()}>
        {sending ? <ActivityIndicator color="#fff" /> : <View style={styles.sendDot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#333',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
