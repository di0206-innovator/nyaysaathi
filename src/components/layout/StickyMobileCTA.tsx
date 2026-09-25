'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';

export function StickyMobileCTA() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Only show on public landing, features, pilot, or info pages (hide on full workspace screens if desired)
  const isWorkspace = pathname?.startsWith('/matters/') && pathname !== '/matters/new';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isWorkspace || !scrolled) return null;

  return (
    <aside
      aria-label="Mobile Quick Action Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-t-2 border-rose-600/40 p-2.5 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        <Link
          href="/features"
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Features</span>
        </Link>
        <Link
          href="/matters/new"
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_#FFFFFF] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-white shrink-0" />
          <span>New Matter</span>
          <ArrowRight className="w-3 h-3 text-white shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
