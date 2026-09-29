import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u } = await api.post('/auth/login', { email, password });
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (email, password, confirmPassword) => {
    const { user: u } = await api.post('/auth/signup', { email, password, confirmPassword });
    setUser(u);
    return u;
  }, []);

  const adminSignup = useCallback(async (email, password, confirmPassword, accessCode) => {
    const { user: u } = await api.post('/auth/admin-signup', { email, password, confirmPassword, accessCode });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, adminSignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
