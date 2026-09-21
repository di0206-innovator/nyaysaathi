'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, X } from 'lucide-react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('nyaysaathi_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => {
          setVisible(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted in certain iframe contexts
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('nyaysaathi_cookie_consent', type);
    } catch {
      // LocalStorage access restricted
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-stone-900/95 text-stone-100 border border-stone-800 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
              <Cookie className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Privacy &amp; Cookie Notice
            </h3>
          </div>
          <button
            onClick={() => handleAccept('essential')}
            className="text-stone-400 hover:text-stone-200 transition-colors p-1"
            aria-label="Close cookie banner and use essential cookies only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed mb-3">
          NyaySaathi uses privacy-first essential cookies to securely maintain session state and prevent fraud under the{' '}
          <span className="text-stone-100 font-medium">Digital Personal Data Protection Act (DPDPA 2023)</span>. We do not sell or monetize personal legal dispute details.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
          <Link
            href="/privacy"
            className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 self-center sm:self-auto py-1"
          >
            <ShieldCheck className="w-3 h-3" />
            Read Privacy Policy
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAccept('essential')}
              className="flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-stone-800 text-stone-300 font-medium transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => handleAccept('all')}
              className="flex-1 sm:flex-none text-xs px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold transition-colors shadow-sm"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
