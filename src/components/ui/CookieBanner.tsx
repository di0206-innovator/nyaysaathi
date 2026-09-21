'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, X } from 'lucide-react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('nyaysaathi_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => {
          setVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted in sandboxes
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('nyaysaathi_cookie_consent', type);
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="bg-[#0A0A0A] text-stone-100 border-2 border-stone-800 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3 border-b border-stone-800 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
              !
            </div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              [DPDPA 2023 // PRIVACY DIRECTIVE]
            </h3>
          </div>
          <button
            onClick={() => handleAccept('essential')}
            className="text-stone-400 hover:text-white p-1 transition-colors"
            aria-label="Close cookie banner and use essential cookies only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed mb-4 font-sans">
          NyaySaathi uses privacy-first session cookies under the{' '}
          <strong className="text-white">Digital Personal Data Protection Act (DPDPA 2023)</strong>. We treat legal disputes as privileged materials and never monetize dispute data.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-stone-800">
          <Link
            href="/privacy"
            className="font-mono text-[11px] text-rose-400 hover:text-rose-300 underline underline-offset-4 flex items-center gap-1 py-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            READ PRIVACY POLICY
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAccept('essential')}
              className="flex-1 sm:flex-none font-mono text-xs px-3 py-1.5 border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold uppercase tracking-wider transition-colors"
            >
              Essential
            </button>
            <button
              onClick={() => handleAccept('all')}
              className="flex-1 sm:flex-none font-mono text-xs px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
