import React from 'react';
import Link from 'next/link';
import { Scale, Plus, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-[#FBFBF9] px-4 py-16 font-sans text-[#0A0A0A]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 border-2 border-[#0A0A0A]">
        <div className="w-14 h-14 bg-rose-600 text-white flex items-center justify-center mx-auto border border-black font-black">
          <Scale className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 border border-rose-300">
            ERROR 404 // DOSSIER NOT FOUND
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A] mt-2">
            Record Does Not Exist
          </h1>
          <p className="text-xs text-stone-600 font-mono leading-relaxed uppercase">
            The legal action docket or procedural page you attempted to access is unavailable or has been archived.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 sm:flex-row sm:justify-center font-mono text-xs">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold uppercase tracking-wider border border-black transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/matters/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider border border-black transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Matter</span>
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-4 font-mono text-[11px] text-stone-500 uppercase">
          <p>
            NALSA FREE LEGAL AID: <span className="font-bold text-black">15100</span> {'//'} <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline">nalsa.gov.in</a>
          </p>
        </div>
      </div>
    </main>
  );
}
