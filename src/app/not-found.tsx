import React from 'react';
import Link from 'next/link';
import { Scale, PlusCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-[#FAF9F5] px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="w-16 h-16 bg-amber-100 border border-amber-300 rounded-2xl mx-auto flex items-center justify-center text-amber-800">
          <Scale className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Matter File Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            The legal action or page you are attempting to access does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/matters/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Matter
          </Link>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <p className="text-[11px] text-stone-500">
            Need immediate free legal aid assistance? Call NALSA at <span className="font-semibold text-stone-700">15100</span> or visit <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">nalsa.gov.in</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
