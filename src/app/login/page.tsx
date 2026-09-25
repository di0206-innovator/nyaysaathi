'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Scale,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Sparkles,
  Zap,
  Building,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/matters';

  const { user, login, signup, setDemoUser, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, show quick welcome banner with redirect option
  if (user) {
    return (
      <div className="max-w-md w-full bg-white border-2 border-stone-900 p-8 shadow-[6px_6px_0px_0px_#0A0A0A] text-center space-y-6">
        <div className="w-14 h-14 bg-rose-100 border-2 border-stone-900 flex items-center justify-center mx-auto text-rose-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-stone-900 tracking-tight">
            Already Signed In
          </h2>
          <p className="text-sm font-mono text-stone-600">
            Active Session: <strong className="text-stone-900">{user.email}</strong>
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => router.push(callbackUrl)}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue to Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/account"
            className="w-full py-2.5 border-2 border-stone-900 text-stone-900 hover:bg-stone-50 font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center"
          >
            Manage Account &amp; Privacy
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const ok = await login(email, password);
        if (ok) {
          showToast('success', 'Signed in successfully!');
          router.push(callbackUrl);
        } else {
          setErrorMsg('Invalid email or password. You can also use 1-Click Fast-Track Demo below.');
        }
      } else {
        const ok = await signup(email, password, fullName || email.split('@')[0]);
        if (ok) {
          showToast('success', 'Account created and signed in!');
          router.push(callbackUrl);
        } else {
          setErrorMsg('Failed to create account. Please try again or use 1-Click Fast-Track Demo.');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaLogin = (personaId: string, name: string) => {
    setDemoUser(personaId, name);
    showToast('success', `Logged in as ${name}`);
    router.push(callbackUrl);
  };

  return (
    <div className="w-full max-w-lg bg-white border-2 border-stone-900 shadow-[8px_8px_0px_0px_#0A0A0A] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b-2 border-stone-100 pb-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-rose-600" />
            STARTUP ACCESS PORTAL
          </span>
          <span className="font-mono text-[10px] text-stone-700 bg-stone-100 px-2 py-0.5 border border-stone-300">
            DPDP ACT COMPLIANT
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-stone-900 tracking-tight leading-none">
          {mode === 'login' ? 'Sign In to NyaySaathi' : 'Create Your Free Account'}
        </h1>
        <p className="text-xs font-mono text-stone-600">
          {mode === 'login'
            ? 'Access your legal dossiers, redlines, contract extractions, and analytics.'
            : 'Join India’s fastest legal AI platform. 100% free for individual citizens.'}
        </p>
      </div>

      {/* 1-Click Fast-Track Personas (Ideal for Instant Demo) */}
      <div className="space-y-2.5 bg-stone-50 border border-stone-200 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            1-Click Instant Demo Personas
          </span>
          <span className="font-mono text-[10px] text-stone-700">No password required</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handlePersonaLogin('citizen-demo-01', 'Rohan Sharma (Tenant / Citizen)')}
            className="p-2.5 bg-white border border-stone-300 hover:border-rose-600 hover:bg-rose-50 text-left transition-all group"
          >
            <div className="flex items-center space-x-1.5 text-stone-800 group-hover:text-rose-600">
              <User className="w-3.5 h-3.5" />
              <span className="font-mono font-bold text-[11px] uppercase">Citizen</span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono truncate">Rohan Sharma</p>
          </button>

          <button
            type="button"
            onClick={() => handlePersonaLogin('counsel-demo-02', 'Adv. Priya Patel (Legal Counsel)')}
            className="p-2.5 bg-white border border-stone-300 hover:border-rose-600 hover:bg-rose-50 text-left transition-all group"
          >
            <div className="flex items-center space-x-1.5 text-stone-800 group-hover:text-rose-600">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="font-mono font-bold text-[11px] uppercase">Advocate</span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono truncate">Adv. Priya Patel</p>
          </button>

          <button
            type="button"
            onClick={() => handlePersonaLogin('founder-demo-03', 'Amit Verma (Startup Founder)')}
            className="p-2.5 bg-white border border-stone-300 hover:border-rose-600 hover:bg-rose-50 text-left transition-all group"
          >
            <div className="flex items-center space-x-1.5 text-stone-800 group-hover:text-rose-600">
              <Building className="w-3.5 h-3.5" />
              <span className="font-mono font-bold text-[11px] uppercase">Enterprise</span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono truncate">Amit Verma</p>
          </button>
        </div>
      </div>

      {/* Social Logins */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full py-3 bg-white border-2 border-stone-900 hover:bg-stone-50 text-stone-900 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-3 shadow-[4px_4px_0px_0px_#0A0A0A] active:shadow-[1px_1px_0px_0px_#0A0A0A] active:translate-y-[3px] active:translate-x-[3px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-stone-200 w-full" />
        <span className="bg-white px-3 font-mono text-[10px] uppercase text-stone-700 tracking-wider">
          Or with email &amp; password
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 border-2 border-stone-900 bg-stone-100 p-0.5">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg('');
          }}
          className={`py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            mode === 'login'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMsg('');
          }}
          className={`py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            mode === 'signup'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Register
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border-2 border-rose-600 text-rose-800 text-xs font-mono flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="block font-mono text-xs font-bold uppercase text-stone-800">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                className="w-full pl-9 pr-3 py-2.5 border-2 border-stone-800 focus:outline-none focus:border-rose-600 text-sm font-sans"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block font-mono text-xs font-bold uppercase text-stone-800">
            Work or Personal Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full pl-9 pr-3 py-2.5 border-2 border-stone-800 focus:outline-none focus:border-rose-600 text-sm font-sans"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-xs font-bold uppercase text-stone-800">
              Password
            </label>
            {mode === 'login' && (
              <span className="font-mono text-[10px] text-stone-700 hover:text-rose-600 cursor-pointer">
                Forgot password?
              </span>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-3 py-2.5 border-2 border-stone-800 focus:outline-none focus:border-rose-600 text-sm font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-stone-900 hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_#e11d48]"
        >
          {loading ? (
            <span className="animate-pulse">Authenticating...</span>
          ) : (
            <>
              <span>{mode === 'login' ? 'Sign In Now' : 'Create Account & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security & Regulatory Footnote */}
      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit Encrypted</span>
        </div>
        <Link href="/terms" className="hover:underline">
          Terms &amp; Disclaimers
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-rose-600 selection:text-white">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Startup Pitch & Value Propositon */}
        <div className="lg:col-span-6 space-y-6 lg:pr-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-stone-900 text-white font-mono text-xs uppercase tracking-wider border-l-4 border-rose-600">
            <Scale className="w-3.5 h-3.5 text-rose-500" />
            <span>NyaySaathi // Legal Tech 2.0</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-stone-900 leading-tight">
            The Intelligent Legal Stack for <span className="text-rose-600">India</span>.
          </h2>

          <p className="text-stone-600 font-mono text-sm leading-relaxed uppercase">
            From semantic clause redlines to enforceable statutory notices under BNS and CPA 2019, NyaySaathi equips citizens, founders, and legal counsels with verified document intelligence.
          </p>

          {/* Social Proof & Metrics Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 p-3 bg-white border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-xs font-bold uppercase text-stone-900">
                  Strict Zero-Hallucination Grounding
                </h4>
                <p className="text-xs text-stone-600">
                  Every extraction and answer includes explicit clause line-level provenance and quotes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-xs font-bold uppercase text-stone-900">
                  Limitation Act &amp; Statutory Calculations
                </h4>
                <p className="text-xs text-stone-600">
                  Automated time-bar detection under Limitation Act 1963 and jurisdiction routing.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-xs font-bold uppercase text-stone-900">
                  Advocate Case Pack Ready
                </h4>
                <p className="text-xs text-stone-600">
                  Download structured court-ready bundles adhering to Advocates Act 1961 standards.
                </p>
              </div>
            </div>
          </div>

          {/* User Testimonial Quote */}
          <div className="p-4 bg-stone-900 text-stone-100 border-l-4 border-rose-500 font-mono text-xs space-y-2">
            <p className="italic text-stone-300">
              &quot;Recovered my entire ₹1.25 Lakh rental security deposit in Bangalore within 14 days of serving the NyaySaathi-drafted notice.&quot;
            </p>
            <div className="text-[11px] text-rose-400 font-bold uppercase">
              — Ankit M., Software Engineer, Koramangala
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-6 flex justify-center">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs">Loading authentication...</div>}>
            <LoginFormContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
