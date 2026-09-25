import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#09090b] text-white p-6 font-mono">
      <div className="relative flex items-center justify-center mb-6">
        {/* Radar pulsing ring */}
        <div className="w-16 h-16 border-2 border-rose-500 rounded-full animate-ping opacity-25" />
        <div className="absolute w-12 h-12 border-2 border-dashed border-rose-500 rounded-full animate-spin" />
        <div className="absolute w-4 h-4 bg-rose-600 border border-white" />
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-1 border border-rose-800">
          PROCEEDING // SYSTEM BUS
        </div>
        <h3 className="text-sm font-black uppercase tracking-tight text-white">
          Fetching Evidentiary Docket...
        </h3>
        <p className="text-[11px] text-stone-400 uppercase leading-relaxed">
          Verifying cryptographic signatures and procedural timelines under Indian Law.
        </p>
      </div>
    </div>
  );
}
