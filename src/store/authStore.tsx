import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, type XhsUserInfo } from '../services/api';

interface AuthState {
  isConnected: boolean;
  isLoading: boolean;
  userInfo: XhsUserInfo | null;
  error: string | null;
  serverOnline: boolean;
}

interface AuthContextType extends AuthState {
  loginWithCookie: (cookie: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isConnected: false,
    isLoading: true,
    userInfo: null,
    error: null,
    serverOnline: false,
  });

  const refreshStatus = useCallback(async () => {
    try {
      await api.health();
      const authStatus = await api.auth.getStatus();
      setState(prev => ({
        ...prev,
        serverOnline: true,
        isConnected: authStatus.authenticated,
        userInfo: authStatus.user_info || null,
        isLoading: false,
        error: null,
      }));
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
    refreshStatus();
  }, [refreshStatus]);

  const loginWithCookie = useCallback(async (cookie: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    try {
      const result = await api.auth.setCookie(cookie);
      if (result.success) {
        const status = await api.auth.getStatus();
        setState(prev => ({
          ...prev,
          isConnected: true,
          userInfo: status.user_info || null,
          isLoading: false,
        }));
        return true;
      }
      setState(prev => ({
        ...prev,
        error: result.error || '连接失败',
        isLoading: false,
      }));
      return false;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : '连接失败',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch { /* ignore */ }
    setState(prev => ({
      ...prev,
      isConnected: false,
      userInfo: null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loginWithCookie, logout, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
