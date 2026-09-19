'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, PlusCircle, FolderLock, PhoneCall } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/40 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xl tracking-tight text-white">NyaySaathi</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    India
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 -mt-0.5 hidden sm:block">Legal Action Navigator</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/matters"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                pathname.startsWith('/matters') && pathname !== '/matters/new'
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <FolderLock className="w-4 h-4" />
              <span>My Matters</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Free Legal Aid Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>NALSA Legal Aid: <strong className="text-emerald-200">15100</strong></span>
            </div>

            {/* User Session Profile Badge */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-stone-800">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-stone-200 leading-none">{user.name || 'User'}</div>
                  <div className="text-[10px] text-amber-400/80 leading-tight">Secure Tenant</div>
                </div>
              </div>
            ) : null}

            <Link
              href="/matters/new"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-sm transition-all shadow-md shadow-amber-900/30 active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-stone-950" />
              <span>New Matter</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
