import { client } from '../client';

export interface Credentials {
  username: string;
  password: string;
}

export interface RegisterInput extends Credentials {
  email: string;
}

export async function register(input: RegisterInput) {
  // Register's schema marks `id` readonly but not optional, the same
  // request/response-conflation artifact as TokenObtainPair below.
  const { data, error } = await client.POST('/api/v1/auth/register/', {
    body: input as RegisterInput & { id: number },
  });
  if (error) throw error;
  return data;
}

export async function login(credentials: Credentials) {
  // TokenObtainPair's schema marks `access`/`refresh` readonly but not optional,
  // an artifact of drf-spectacular reusing simplejwt's serializer for both the
  // request and response shape. The request body is really just Credentials.
  const { data, error } = await client.POST('/api/v1/auth/token/', {
    body: credentials as Credentials & { access: string; refresh: string },
  });
  if (error) throw error;
  return data;
}

export async function blacklistRefreshToken(refresh: string) {
  await client.POST('/api/v1/auth/token/blacklist/', { body: { refresh } });
}
