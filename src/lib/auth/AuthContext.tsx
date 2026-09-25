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
  signInWithGoogle: () => Promise<boolean>;
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
    let authSubscription: { unsubscribe: () => void } | null = null;

    async function initAuth() {
      // 1. Check server session via cookie
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
      }

      // 2. Subscribe to Supabase client auth events if configured
      try {
        const { getSupabaseBrowserClient, isSupabaseConfigured } = await import('@/lib/db/supabase');
        if (isSupabaseConfigured()) {
          const client = getSupabaseBrowserClient();
          if (client) {
            const { data } = client.auth.onAuthStateChange(async (event, session) => {
              if (!active) return;
              if (session?.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                  role: session.user.role,
                });
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
              }
            });
            authSubscription = data.subscription;
          }
        }
      } catch {
        // Supabase client not available
      } finally {
        if (active) setLoading(false);
      }
    }

    initAuth();
    return () => {
      active = false;
      authSubscription?.unsubscribe();
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

  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { getSupabaseBrowserClient, isSupabaseConfigured } = await import('@/lib/db/supabase');
      if (isSupabaseConfigured()) {
        const client = getSupabaseBrowserClient();
        if (client) {
          const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback?next=/matters`
            }
          });
          if (error) {
            console.error('Google Sign-In Error:', error.message);
            return false;
          }
          return true;
        }
      }
      // Fallback for mock mode if Supabase isn't configured
      console.warn('Supabase not configured, using mock Google login');
      setDemoUser('google-demo-user', 'Google User');
      return true;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
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
    <AuthContext.Provider value={{ user, loading, token: null, isDemo, login, signup, signInWithGoogle, logout, setDemoUser, enableDemoMode }}>
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
