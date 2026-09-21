'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Plus, FolderLock, PhoneCall, BarChart3, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline - Swiss Modernist Typography */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-rose-600 text-white flex items-center justify-center font-black rounded-none shadow-none group-hover:bg-rose-500 transition-colors">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-base sm:text-lg tracking-tight uppercase text-white font-sans">
                    NyaySaathi
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-1 sm:px-1.5 py-0.5 bg-stone-800 text-stone-300 border border-stone-700 hidden sm:inline">
                    IN // NAVIGATOR
                  </span>
                </div>
                <span className="font-mono text-[10px] text-stone-400 tracking-wider hidden sm:block uppercase">
                  Matter-Based Legal Action Architecture
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Structural Grid Style */}
          <nav className="hidden lg:flex items-center space-x-1 border-l border-r border-stone-800 px-2 h-16">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                pathname === '/'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900'
              }`}
            >
              01 // Home
            </Link>
            <Link
              href="/matters"
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${
                pathname.startsWith('/matters') && pathname !== '/matters/new'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5 text-stone-400" />
              <span>02 // Matters</span>
            </Link>
            <Link
              href="/pilot"
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${
                pathname === '/pilot'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 font-bold'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span>03 // Pilot Intake</span>
            </Link>
            <Link
              href="/analytics"
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${
                pathname === '/analytics'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-400" />
              <span>04 // Analytics</span>
            </Link>
          </nav>

          {/* Right Action Elements */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* NALSA Statutory Helpline Badge */}
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[11px]">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>AID: <strong className="text-white">15100</strong></span>
            </div>

            {/* User Session Profile Badge */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-stone-800">
                <div className="w-7 h-7 bg-stone-800 border border-stone-700 flex items-center justify-center font-mono text-xs font-bold text-rose-400">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-mono text-xs font-medium text-stone-200 leading-none">{user.name || 'User'}</div>
                  <div className="font-mono text-[9px] text-stone-400 uppercase tracking-widest leading-tight">AUTHENTICATED</div>
                </div>
              </div>
            ) : null}

            {/* Swiss Red Action Trigger */}
            <Link
              href="/matters/new"
              className="inline-flex items-center space-x-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors active:translate-y-px shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="hidden xs:inline sm:inline">New Matter</span>
              <span className="inline xs:hidden sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
