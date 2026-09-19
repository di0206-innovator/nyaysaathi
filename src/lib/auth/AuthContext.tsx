'use client';

import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;
  isDemo: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, password?: string, fullName?: string) => Promise<boolean>;
  logout: () => void;
  setDemoUser: (id: string, name?: string) => void;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = localStorage.getItem('nyaysaathi_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    // Only default to demo user if explicit environment variable is enabled
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return {
        id: 'citizen-demo-01',
        email: 'rohan.sharma@nyaysaathi.in',
        name: 'Rohan Sharma (Demo)',
        role: 'authenticated'
      };
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedToken = localStorage.getItem('nyaysaathi_token');
    if (savedToken) return savedToken;
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return 'mock-user-citizen-demo-01';
    }
    return null;
  });

  const isDemo = Boolean(
    (token && token.startsWith('mock-user-')) ||
    (user && (user.id.includes('demo') || user.email.includes('demo')))
  );

  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password: password || 'demo-pass' })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        const t = data.data.token || (data.data.session?.access_token) || `mock-user-${u.id}`;
        setUser(u);
        setToken(t);
        localStorage.setItem('nyaysaathi_user', JSON.stringify(u));
        localStorage.setItem('nyaysaathi_token', t);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password?: string, fullName?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password: password || 'demo-pass', fullName })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        const t = data.data.token || (data.data.session?.access_token) || `mock-user-${u.id}`;
        setUser(u);
        setToken(t);
        localStorage.setItem('nyaysaathi_user', JSON.stringify(u));
        localStorage.setItem('nyaysaathi_token', t);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nyaysaathi_user');
    localStorage.removeItem('nyaysaathi_token');
  };

  const setDemoUser = (id: string, name?: string) => {
    const u: UserProfile = {
      id,
      email: `${id}@nyaysaathi.in`,
      name: name || `User ${id}`,
      role: 'authenticated'
    };
    const t = `mock-user-${id}`;
    setUser(u);
    setToken(t);
    localStorage.setItem('nyaysaathi_user', JSON.stringify(u));
    localStorage.setItem('nyaysaathi_token', t);
  };

  const enableDemoMode = () => {
    setDemoUser('citizen-demo-01', 'Rohan Sharma (Demo)');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, isDemo, login, signup, logout, setDemoUser, enableDemoMode }}>
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
