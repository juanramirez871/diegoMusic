import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string; avatar: string } | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = useCallback(() => {
    setUser({
      name: 'Juan Diego',
      email: 'juandiegoramirez071@gmail.com',
      avatar: '',
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
