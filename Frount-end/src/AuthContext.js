import React, { createContext, useCallback, useMemo, useState } from 'react';

const AuthContext = createContext({
  token: null,
  userId: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

function readStoredAuth() {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('authUserId');
  return { token, userId };
}

export function AuthProvider({ children }) {
  const stored = readStoredAuth();
  const [token, setToken] = useState(stored.token);
  const [userId, setUserId] = useState(stored.userId);

  const login = useCallback((newToken, newUserId) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUserId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
    setToken(null);
    setUserId(null);
  }, []);

  const value = useMemo(() => ({
    token,
    userId,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [token, userId, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
