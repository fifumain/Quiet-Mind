import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { GlassBackground } from '../../src/components/common/GlassBackground';
import { SpecularButton } from '../../src/components/common/SpecularButton';
import { useRegister } from '../../src/hooks/useAuth';
import { formatApiError } from '../../src/lib/formatApiError';
import { glassBlur, theme } from '../../src/theme/theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();

  const disabled = register.isPending || !username || !email || !password;

  return (
    <GlassBackground>
      <View style={styles.container}>
        <Text style={styles.brand}>Alex</Text>
        <Text style={styles.title}>Создать аккаунт</Text>

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
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, glassBlur()]}
          placeholder="Пароль (минимум 8 символов)"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {register.isError ? (
          <Text style={styles.error}>{formatApiError(register.error, 'Не удалось зарегистрироваться. Проверьте данные.')}</Text>
        ) : null}

        <SpecularButton
          style={[styles.button, disabled && styles.buttonDisabled]}
          disabled={disabled}
          onPress={() => register.mutate({ username, email, password })}
        >
          {register.isPending ? (
            <ActivityIndicator color={theme.gradient[0]} />
          ) : (
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          )}
        </SpecularButton>

        <Link href="/login" style={styles.link}>
          Уже есть аккаунт? Войти
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
