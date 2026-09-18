import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const INITIAL_USER = JSON.parse(localStorage.getItem('nirovveda_user') || 'null');
const INITIAL_TOKEN = localStorage.getItem('nirovveda_token');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(INITIAL_USER);
  const [token, setToken] = useState(INITIAL_TOKEN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('nirovveda_token', res.token);
      localStorage.setItem('nirovveda_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('nirovveda_token', res.token);
      localStorage.setItem('nirovveda_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nirovveda_token');
    localStorage.removeItem('nirovveda_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.user);
      localStorage.setItem('nirovveda_user', JSON.stringify(res.user));
    } catch (e) {
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      // verify token on load
      api.get('/auth/me').then(res => {
        setUser(res.user);
        localStorage.setItem('nirovveda_user', JSON.stringify(res.user));
      }).catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, refreshUser, setError }}>
      {children}
    </AuthContext.Provider>
  );
}