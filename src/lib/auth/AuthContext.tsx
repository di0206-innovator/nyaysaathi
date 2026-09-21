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
    // Only default to demo user if explicit demo mode is set
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

  const isDemo = Boolean(
    user && (user.id.includes('demo') || user.email.includes('demo'))
  );

  const [loading, setLoading] = useState<boolean>(true);

  React.useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const res = await fetch('/api/auth', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (active && json.success && json.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch {
        // Unauthenticated session
      } finally {
        if (active) setLoading(false);
      }
    }
    checkSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password: password || 'demo-pass' })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password: password || 'demo-pass', fullName })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch {
      // Ignored
    }
  };

  const setDemoUser = (id: string, name?: string) => {
    const u: UserProfile = {
      id,
      email: `${id}@nyaysaathi.in`,
      name: name || `User ${id}`,
      role: 'authenticated'
    };
    setUser(u);
  };

  const enableDemoMode = () => {
    setDemoUser('citizen-demo-01', 'Rohan Sharma (Demo)');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token: null, isDemo, login, signup, logout, setDemoUser, enableDemoMode }}>
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
