import React from 'react';
import Link from 'next/link';
import { Scale, Plus, Home, Compass, PhoneCall } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-[#09090b] px-4 py-20 font-sans text-stone-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full text-center space-y-8 bg-black/80 backdrop-blur-md p-8 sm:p-10 border-2 border-stone-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
        <div className="w-16 h-16 bg-rose-600 text-white flex items-center justify-center mx-auto border-2 border-rose-500 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] font-black">
          <Scale className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-3">
          <div className="inline-block font-mono text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/80 px-3 py-1 border border-rose-800">
            ERROR 404 // JURISDICTIONAL VOID
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2">
            Record Does Not Exist
          </h1>
          <p className="text-xs text-stone-300 font-mono leading-relaxed uppercase">
            The legal action docket, document comparison, or procedural route you attempted to access is unavailable or has been archived.
          </p>
        </div>

        {/* Clear Call to Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-center font-mono text-xs">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-100 hover:bg-white text-black font-bold uppercase tracking-wider border-2 border-stone-200 transition-all hover:scale-[1.02] shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <Home className="w-4 h-4 text-black" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/matters/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider border-2 border-rose-500 transition-all hover:scale-[1.02] shadow-[3px_3px_0px_0px_rgba(244,63,94,0.4)]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Matter</span>
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold uppercase tracking-wider border-2 border-stone-700 transition-all hover:scale-[1.02]"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Features</span>
          </Link>
        </div>

        <div className="border-t border-stone-800 pt-5 font-mono text-xs text-stone-400 uppercase space-y-2">
          <div className="flex items-center justify-center gap-2 text-stone-300">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>NALSA FREE LEGAL AID HELPLINE: <strong className="text-white">15100</strong></span>
          </div>
          <p className="text-[10px] text-stone-400">
            DIGITAL LEGAL ACTION NAVIGATOR FOR THE REPUBLIC OF INDIA
          </p>
        </div>
      </div>
    </main>
  );
}
