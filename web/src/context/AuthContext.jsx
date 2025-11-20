import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken as saveToken, getUser, setUser as saveUser, clearToken } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(false);

  const login = (newToken, newUser) => {
    saveToken(newToken);
    saveUser(newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
