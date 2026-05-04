import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000/api';

const AUTH_STORAGE_KEY = '@auth_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY).then(raw => {
      if (raw) setUser(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) handleGoogleAuth(accessToken);
    } else if (response?.type === 'error' || response?.type === 'cancel' || response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleAuth = async (accessToken: string) => {
    try {
      const backendRes = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!backendRes.ok) throw new Error('Backend auth failed');

      const { user: userData } = await backendRes.json();
      setUser(userData);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    }
    catch (err) {
      console.error('[Auth] Google auth failed:', err);
    }
    finally {
      setLoading(false);
    }
  };

  const login = useCallback(() => {
    setLoading(true);
    promptAsync();
  }, [promptAsync]);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
