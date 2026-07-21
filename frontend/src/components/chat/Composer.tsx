import { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SpecularButton } from '../common/SpecularButton';
import { glassBlur, theme } from '../../theme/theme';

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
    <View style={[styles.container, glassBlur()]}>
      <TextInput
        style={styles.input}
        placeholder="Написать Alex…"
        placeholderTextColor={theme.colors.textMuted}
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
      <SpecularButton style={styles.sendButton} onPress={submit} disabled={disabled || !value.trim()} radius={theme.radius.sm}>
        <View style={styles.sendButtonInner}>
          {sending ? <ActivityIndicator color={theme.colors.textPrimary} /> : <View style={styles.sendDot} />}
        </View>
      </SpecularButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    alignItems: 'flex-end',
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    maxHeight: 120,
  },
  sendButton: { width: 34, height: 34 },
  sendButtonInner: {
    flex: 1,
    backgroundColor: theme.glass.fillStrong,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.textPrimary },
});
