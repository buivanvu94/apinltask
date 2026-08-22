import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, LoginCredentials, AuthState } from '../types/auth';
import { login as apiLogin, logout as apiLogout, getMe, refresh as apiRefresh } from '../services/auth-service';
import { getRefreshToken, setAccessToken, setRefreshToken, clearAllTokens } from '../services/token-storage';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const storedRefreshToken = await getRefreshToken();
        if (storedRefreshToken) {
          const refreshRes = await apiRefresh(storedRefreshToken);
          setAccessToken(refreshRes.accessToken);
          if (refreshRes.refreshToken) {
            await setRefreshToken(refreshRes.refreshToken);
          }
          const currentUser = await getMe();
          if (isMounted) {
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.warn('Could not restore auth session:', err);
        await clearAllTokens();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const onCustomLogout = () => {
      setUser(null);
    };
    window.addEventListener('nltask:auth-logout', onCustomLogout);

    return () => {
      isMounted = false;
      window.removeEventListener('nltask:auth-logout', onCustomLogout);
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login: handleLogin,
      logout: handleLogout,
    }),
    [user, isLoading, handleLogin, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
