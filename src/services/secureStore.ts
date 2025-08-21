import * as SecureStore from 'expo-secure-store';

export type AuthProvider = 'google' | 'apple';

const LAST_AUTH_PROVIDER_KEY = 'last_auth_provider';

export async function saveLastAuthProvider(provider: AuthProvider): Promise<void> {
  try {
    await SecureStore.setItemAsync(LAST_AUTH_PROVIDER_KEY, provider);
  } catch (error) {
    console.warn('Failed to save last_auth_provider:', error);
  }
}

export async function getLastAuthProvider(): Promise<AuthProvider | null> {
  try {
    const value = await SecureStore.getItemAsync(LAST_AUTH_PROVIDER_KEY);
    return value === 'google' || value === 'apple' ? value : null;
  } catch (error) {
    console.warn('Failed to read last_auth_provider:', error);
    return null;
  }
}

export async function clearLastAuthProvider(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(LAST_AUTH_PROVIDER_KEY);
  } catch (error) {
    console.warn('Failed to clear last_auth_provider:', error);
  }
}
