import { Store } from '@tauri-apps/plugin-store';

const REFRESH_TOKEN_KEY = 'nltask_refresh_token';
let memoryAccessToken: string | null = null;
let storePromise: Promise<Store> | null = null;

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function getStore(): Promise<Store | null> {
  if (!isTauri()) return null;
  if (!storePromise) {
    storePromise = Store.load('auth.json');
  }
  return storePromise;
}

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  memoryAccessToken = token;
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const store = await getStore();
    if (store) {
      const val = await store.get<string>(REFRESH_TOKEN_KEY);
      return val || null;
    }
  } catch (err) {
    console.warn('Failed to read refreshToken from Tauri store:', err);
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string | null): Promise<void> {
  try {
    const store = await getStore();
    if (store) {
      if (token) {
        await store.set(REFRESH_TOKEN_KEY, token);
      } else {
        await store.delete(REFRESH_TOKEN_KEY);
      }
      await store.save();
      return;
    }
  } catch (err) {
    console.warn('Failed to write refreshToken to Tauri store:', err);
  }

  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function clearAllTokens(): Promise<void> {
  setAccessToken(null);
  await setRefreshToken(null);
}
