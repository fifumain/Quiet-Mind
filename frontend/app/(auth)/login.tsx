import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { GlassBackground } from '../../src/components/common/GlassBackground';
import { SpecularButton } from '../../src/components/common/SpecularButton';
import { useLogin } from '../../src/hooks/useAuth';
import { formatApiError } from '../../src/lib/formatApiError';
import { glassBlur, theme } from '../../src/theme/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  return (
    <GlassBackground>
      <View style={styles.container}>
        <Text style={styles.brand}>Alex</Text>
        <Text style={styles.title}>С возвращением</Text>

        <TextInput
          style={[styles.input, glassBlur()]}
          placeholder="Имя пользователя"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={[styles.input, glassBlur()]}
          placeholder="Пароль"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {login.isError ? (
          <Text style={styles.error}>{formatApiError(login.error, 'Неверное имя пользователя или пароль.')}</Text>
        ) : null}

        <SpecularButton
          style={[styles.button, (login.isPending || !username || !password) && styles.buttonDisabled]}
          disabled={login.isPending || !username || !password}
          onPress={() => login.mutate({ username, password })}
        >
          {login.isPending ? (
            <ActivityIndicator color={theme.gradient[0]} />
          ) : (
            <Text style={styles.buttonText}>Войти</Text>
          )}
        </SpecularButton>

        <Link href="/register" style={styles.link}>
          Нет аккаунта? Зарегистрироваться
        </Link>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md, maxWidth: 420, width: '100%', alignSelf: 'center' },
  brand: { color: theme.colors.textPrimary, fontSize: theme.fontSize.xl, fontWeight: '700', textAlign: 'center' },
  title: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, textAlign: 'center', marginBottom: theme.spacing.md },
  input: {
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  error: { color: theme.colors.danger, fontSize: theme.fontSize.sm },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: theme.gradient[0], fontSize: theme.fontSize.md, fontWeight: '700' },
  link: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: theme.spacing.md, textDecorationLine: 'underline' },
});
