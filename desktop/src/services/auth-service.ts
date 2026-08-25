import { apiClient } from './api-client';
import { setAccessToken, setRefreshToken, getRefreshToken, clearAllTokens } from './token-storage';
import { AuthResponse, LoginCredentials, RefreshResponse, User } from '../types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  const data = response.data;
  setAccessToken(data.accessToken);
  await setRefreshToken(data.refreshToken);
  return data;
}

export async function refresh(token: string): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken: token });
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    const token = await getRefreshToken();
    if (token) {
      await apiClient.post('/auth/logout', { refreshToken: token });
    }
  } catch (err) {
    console.warn('Logout endpoint failed:', err);
  } finally {
    await clearAllTokens();
  }
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

export async function updateMyDeviceToken(deviceToken: string | null): Promise<User> {
  const response = await apiClient.patch<User>('/auth/me', { deviceToken });
  return response.data;
}
