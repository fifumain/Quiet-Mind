import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRegister } from '../../src/hooks/useAuth';
import { formatApiError } from '../../src/lib/formatApiError';
import { theme } from '../../src/theme/theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {register.isError ? (
        <Text style={styles.error}>{formatApiError(register.error, 'Registration failed. Check your details.')}</Text>
      ) : null}

      <Pressable
        style={styles.button}
        disabled={register.isPending || !username || !email || !password}
        onPress={() => register.mutate({ username, email, password })}
      >
        {register.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </Pressable>

      <Link href="/login" style={styles.link}>
        Already have an account? Log in
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
