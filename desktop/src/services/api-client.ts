import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearAllTokens } from './token-storage';
import { RefreshResponse } from '../types/auth';

const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'https://apinltask.nguyenluan.vn';
const BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function executeRefreshToken(): Promise<string | null> {
  const currentRefreshToken = await getRefreshToken();
  if (!currentRefreshToken) {
    await clearAllTokens();
    return null;
  }

  try {
    const response = await axios.post<RefreshResponse>(
      `${BASE_URL}/auth/refresh`,
      { refreshToken: currentRefreshToken }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setAccessToken(accessToken);
    if (newRefreshToken) {
      await setRefreshToken(newRefreshToken);
    }
    return accessToken;
  } catch (err) {
    await clearAllTokens();
    window.dispatchEvent(new CustomEvent('nltask:auth-logout'));
    return null;
  } finally {
    refreshPromise = null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = executeRefreshToken();
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
