'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scale,
  Plus,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  ArrowLeftRight,
  MessageSquare,
  FolderLock,
  Compass,
  BarChart3,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

const productLinks = [
  { href: '/understand', label: 'Understand', desc: 'AI document analysis', icon: BookOpen, color: 'from-violet-500/20 to-violet-600/10' },
  { href: '/compare', label: 'Compare', desc: 'Semantic clause diff', icon: ArrowLeftRight, color: 'from-sky-500/20 to-sky-600/10' },
  { href: '/ask', label: 'Ask Doc', desc: 'Document Q&A', icon: MessageSquare, color: 'from-emerald-500/20 to-emerald-600/10' },
  { href: '/matters', label: 'Matters', desc: 'Case management', icon: FolderLock, color: 'from-rose-500/20 to-rose-600/10' },
];

const moreLinks = [
  { href: '/pilot', label: 'Pilot', icon: Compass },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect scroll for glass intensification
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProductDropdownOpen(false);
  }, [pathname]);

  const isProductActive = productLinks.some(p => pathname.startsWith(p.href));

  const onDropEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProductDropdownOpen(true);
  };
  const onDropLeave = () => {
    timerRef.current = setTimeout(() => setProductDropdownOpen(false), 180);
  };

  return (
    <>
      {/* ── Glassmorphic Header ─────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/75 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-[#0A0A0A]/60 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]'
        }`}
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Subtle gradient sheen across the top */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Brand ───────────────────────────── */}
            <Link href="/" className="flex items-center space-x-3 group shrink-0">
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-lg bg-rose-600/30 blur-md group-hover:bg-rose-500/50 transition-all duration-300" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-700 rounded-lg flex items-center justify-center shadow-lg border border-rose-400/20">
                  <Scale className="w-[18px] h-[18px] text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-tight uppercase text-white leading-tight font-sans">
                  NyaySaathi
                </span>
                <span className="text-[10px] text-white/35 tracking-widest uppercase hidden sm:block leading-tight font-mono font-bold">
                  Legal AI • India
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ─────────────────────── */}
            <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-1 ml-10">
              <GlassNavLink href="/" active={pathname === '/'}>Home</GlassNavLink>
              <GlassNavLink href="/features" active={pathname === '/features'}>Features</GlassNavLink>

              {/* Product Dropdown */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={onDropEnter}
                onMouseLeave={onDropLeave}
              >
                <button
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-[11px] font-mono font-bold uppercase tracking-widest rounded-lg transition-all duration-150 ${
                    isProductActive || productDropdownOpen
                      ? 'text-white bg-white/10 border border-white/15'
                      : 'text-white/60 hover:text-white hover:bg-white/8 border border-transparent'
                  }`}
                >
                  <span>Product</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
                      productDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Mega dropdown */}
                {productDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2.5 w-80 rounded-2xl z-50 overflow-hidden"
                    style={{
                      background: 'rgba(15, 15, 15, 0.92)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow:
                        '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.1) inset',
                    }}
                  >
                    {/* Sheen */}
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
                      }}
                    />
                    <div className="relative p-2">
                      {productLinks.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`group flex items-start space-x-3.5 px-3.5 py-3 rounded-xl transition-all duration-150 ${
                            pathname.startsWith(link.href)
                              ? 'bg-rose-600/20 border border-rose-500/30'
                              : 'hover:bg-white/6 border border-transparent hover:border-white/10'
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${link.color} border border-white/10`}
                          >
                            <link.icon className="w-4 h-4 text-white/80" />
                          </div>
                          <div>
                            <div className={`text-[11px] font-bold font-mono uppercase tracking-widest leading-tight ${pathname.startsWith(link.href) ? 'text-rose-300' : 'text-white/90'}`}>
                              {link.label}
                            </div>
                            <div className="text-[10px] text-white/35 mt-0.5 font-mono uppercase tracking-wider">{link.desc}</div>
                          </div>
                        </Link>
                      ))}

                      <div
                        className="mt-1.5 pt-1.5 mx-1"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {moreLinks.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-[11px] font-mono uppercase tracking-widest font-bold ${
                              pathname === link.href
                                ? 'text-rose-400 bg-rose-600/10'
                                : 'text-white/45 hover:text-white/80 hover:bg-white/6'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* ── Right Actions ────────────────────── */}
            <div className="flex items-center space-x-2.5">
              {user ? (
                <>
                  {/* New Matter pill */}
                  <Link
                    href="/matters/new"
                    className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-widest rounded-lg transition-all duration-200 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                      boxShadow: '0 0 20px rgba(225,29,72,0.35), 0 2px 8px rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Matter</span>
                  </Link>

                  {/* User avatar */}
                  <div
                    className="flex items-center space-x-1.5 pl-2"
                    style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Link
                      href="/account"
                      className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg hover:bg-white/8 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white border border-rose-500/40"
                        style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.4), rgba(190,18,60,0.6))' }}
                      >
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="hidden md:block text-[11px] font-mono font-bold uppercase tracking-widest text-white/75 max-w-[100px] truncate">
                        {user.name?.split(' ')[0] || 'Account'}
                      </span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-white/55 hover:text-white hover:bg-white/8 rounded-lg transition-colors border border-transparent hover:border-white/10"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center space-x-2 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-widest rounded-lg transition-all duration-200 active:scale-95 shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                      boxShadow: '0 0 20px rgba(225,29,72,0.35), 0 2px 8px rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Get Started</span>
                    <span className="inline xs:hidden">Start</span>
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden"
            style={{
              background: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="max-w-7xl mx-auto px-5 py-5 space-y-1">
              <MobileGlassLink href="/" active={pathname === '/'}>Home</MobileGlassLink>
              <MobileGlassLink href="/features" active={pathname === '/features'}>Features</MobileGlassLink>

              <div className="pt-4 pb-1">
                <p className="text-[10px] font-mono font-bold text-white/25 uppercase tracking-widest px-3 pb-2">
                  Product Suite
                </p>
                {productLinks.map(link => (
                  <MobileGlassLink key={link.href} href={link.href} active={pathname.startsWith(link.href)}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${link.color} border border-white/10`}>
                        <link.icon className="w-3.5 h-3.5 text-white/70" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold uppercase tracking-widest">{link.label}</div>
                        <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{link.desc}</div>
                      </div>
                    </div>
                  </MobileGlassLink>
                ))}
              </div>

              <div className="pt-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] font-mono font-bold text-white/25 uppercase tracking-widest px-3 pb-2">
                  More
                </p>
                {moreLinks.map(link => (
                  <MobileGlassLink key={link.href} href={link.href} active={pathname === link.href}>
                    <div className="flex items-center space-x-3">
                      <link.icon className="w-4 h-4 text-white/40" />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{link.label}</span>
                    </div>
                  </MobileGlassLink>
                ))}
              </div>

              <div className="pt-4 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {user ? (
                  <div className="flex items-center justify-between px-3">
                    <Link href="/account" className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white border border-rose-500/40"
                        style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.4), rgba(190,18,60,0.6))' }}
                      >
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/85">{user.name || 'Account'}</div>
                        <div className="text-[10px] text-white/35 font-mono tracking-wider">{user.email}</div>
                      </div>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full py-3 rounded-xl text-[11px] font-mono font-bold uppercase tracking-widest text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                      boxShadow: '0 0 20px rgba(225,29,72,0.3)',
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sign In to NyaySaathi
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ── Shared sub-components ──────────────────────────────── */

function GlassNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`px-3.5 py-2 text-[11px] font-mono font-bold uppercase tracking-widest rounded-lg transition-all duration-150 border ${
        active
          ? 'text-white bg-white/10 border-white/15'
          : 'text-white/55 hover:text-white hover:bg-white/8 border-transparent hover:border-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileGlassLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-widest transition-all border ${
        active
          ? 'bg-rose-600/15 text-rose-300 border-rose-500/25'
          : 'text-white/60 hover:text-white hover:bg-white/6 border-transparent hover:border-white/10'
      }`}
    >
      {children}
    </Link>
  );
}
