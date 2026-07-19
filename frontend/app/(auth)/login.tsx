import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLogin } from '../../src/hooks/useAuth';
import { formatApiError } from '../../src/lib/formatApiError';
import { theme } from '../../src/theme/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {login.isError ? (
        <Text style={styles.error}>{formatApiError(login.error, 'Invalid username or password.')}</Text>
      ) : null}

      <Pressable
        style={styles.button}
        disabled={login.isPending || !username || !password}
        onPress={() => login.mutate({ username, password })}
      >
        {login.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </Pressable>

      <Link href="/register" style={styles.link}>
        Need an account? Register
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
  title: { fontSize: theme.fontSize.xl, marginBottom: theme.spacing.md },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: theme.fontSize.md },
  error: { color: 'red' },
  link: { textAlign: 'center', textDecorationLine: 'underline', marginTop: theme.spacing.md },
});
