import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setSessionId, clearSessionId, type XhsUserInfo } from '../services/api';

interface AuthState {
  isConnected: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  userInfo: XhsUserInfo | null;
  error: string | null;
  serverOnline: boolean;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isConnected: false,
    isConfigured: false,
    isLoading: true,
    userInfo: null,
    error: null,
    serverOnline: false,
  });

  const refreshStatus = useCallback(async () => {
    try {
      const health = await api.health();
      const authStatus = await api.auth.getStatus();

      setState(prev => ({
        ...prev,
        serverOnline: true,
        isConfigured: health.configured,
        isConnected: authStatus.authenticated,
        userInfo: authStatus.userInfo || null,
        isLoading: false,
        error: null,
      }));

      if (authStatus.expired) {
        try {
          await api.auth.refresh();
          const newStatus = await api.auth.getStatus();
          setState(prev => ({
            ...prev,
            isConnected: newStatus.authenticated,
            userInfo: newStatus.userInfo || null,
          }));
        } catch {
          setState(prev => ({ ...prev, isConnected: false, userInfo: null }));
        }
      }
    } catch {
      setState(prev => ({
        ...prev,
        serverOnline: false,
        isLoading: false,
        error: null,
      }));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    if (session) {
      setSessionId(session);
      window.history.replaceState({}, '', window.location.pathname);
    }
    refreshStatus();
  }, [refreshStatus]);

  const login = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const { url } = await api.auth.getLoginUrl();
      window.location.href = url;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : '获取登录链接失败',
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore logout errors
    }
    clearSessionId();
    setState(prev => ({
      ...prev,
      isConnected: false,
      userInfo: null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
