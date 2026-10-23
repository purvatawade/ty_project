'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'client';

interface UserSession {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (userData: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('arogya_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('arogya_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem('arogya_user', JSON.stringify(userData));

    if (userData.role === 'admin') {
      router.push('/doctor-workspace');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arogya_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}