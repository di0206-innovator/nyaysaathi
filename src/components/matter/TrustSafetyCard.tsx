'use client';

import React, { useState } from 'react';
import { TrustSafetyItem } from '@/types/matter';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Scale,
  Info
} from 'lucide-react';

interface TrustSafetyCardProps {
  items: TrustSafetyItem[];
  auditLog?: Array<{
    original: string;
    rewritten: string;
    reason: string;
    timestamp: string;
    component?: string;
  }>;
}

export function TrustSafetyCard({ items, auditLog = [] }: TrustSafetyCardProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'fact' | 'explanation' | 'possibility' | 'counsel_required' | 'unsupported'>('all');
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter(i => i.tier === activeFilter);

  const factsCount = items.filter(i => i.tier === 'fact').length;
  const explCount = items.filter(i => i.tier === 'explanation').length;
  const possCount = items.filter(i => i.tier === 'possibility').length;
  const counselCount = items.filter(i => i.tier === 'counsel_required').length;
  const unsuppCount = items.filter(i => i.tier === 'unsupported').length;

  return (
    <div className="bg-white border border-black overflow-hidden">
      {/* Header */}
      <div className="bg-black text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-sm">
              §
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">AUDIT PROTOCOL 01</div>
              <h3 className="font-mono font-bold text-base uppercase text-white tracking-tight">Trust & Safety Transparency Register</h3>
              <p className="text-xs text-stone-300 font-sans">
                NyaySaathi strictly separates verified facts, legal explanations, possibilities, lawyer-advised items, and unsupported claims.
              </p>
            </div>
          </div>

          {auditLog.length > 0 && (
            <button
              onClick={() => setShowAuditDrawer(!showAuditDrawer)}
              className="px-3 py-1.5 bg-stone-900 hover:bg-rose-600 border border-stone-700 hover:border-rose-600 text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center space-x-2 transition-colors self-start sm:self-auto"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>{showAuditDrawer ? 'HIDE SAFETY AUDIT' : `VIEW AUDIT TRAIL [${auditLog.length}]`}</span>
            </button>
          )}
        </div>

        {/* 5-Tier Interactive Filter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-5 pt-3 border-t border-stone-800 font-mono text-xs">
          <button
            onClick={() => setActiveFilter(activeFilter === 'fact' ? 'all' : 'fact')}
            className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase transition-all ${
              activeFilter === 'fact'
                ? 'bg-rose-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>1. Facts</span>
            </span>
            <span className="px-1.5 py-0.2 bg-black text-[10px]">{factsCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'explanation' ? 'all' : 'explanation')}
            className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase transition-all ${
              activeFilter === 'explanation'
                ? 'bg-white text-black font-bold'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>2. Meaning</span>
            </span>
            <span className="px-1.5 py-0.2 bg-black text-[10px] text-white">{explCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'possibility' ? 'all' : 'possibility')}
            className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase transition-all ${
              activeFilter === 'possibility'
                ? 'bg-stone-200 text-black font-bold'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>3. Potential</span>
            </span>
            <span className="px-1.5 py-0.2 bg-black text-[10px] text-white">{possCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'counsel_required' ? 'all' : 'counsel_required')}
            className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase transition-all ${
              activeFilter === 'counsel_required'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span>4. Lawyer</span>
            </span>
            <span className="px-1.5 py-0.2 bg-black text-[10px] text-white">{counselCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'unsupported' ? 'all' : 'unsupported')}
            className={`col-span-2 sm:col-span-1 flex items-center justify-between px-3 py-2 text-xs font-bold uppercase transition-all ${
              activeFilter === 'unsupported'
                ? 'bg-stone-700 text-white font-bold'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>5. Unproven</span>
            </span>
            <span className="px-1.5 py-0.2 bg-black text-[10px] text-white">{unsuppCount}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Safety Audit Trail Drawer */}
      {showAuditDrawer && auditLog.length > 0 && (
        <div className="bg-amber-50/60 border-b border-amber-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Safety Audit Trail: Neutralized & Grounded Claims ({auditLog.length})</span>
            </h4>
            <span className="text-[11px] text-amber-800">
              Statements automatically softened into factual legal language
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {auditLog.map((log, i) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-amber-200/80 text-xs shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-rose-700 line-through font-mono">&quot;{log.original}&quot;</span>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase">{log.component || 'AI Safety'}</span>
                </div>
                <div className="text-emerald-800 font-medium">
                  → &quot;{log.rewritten}&quot;
                </div>
                <div className="text-[11px] text-stone-500 italic">
                  Rationale: {log.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="p-5 divide-y divide-black/10 space-y-4 font-sans">
        {filteredItems.map((item, index) => {
          let badgeClass = 'bg-stone-100 text-black border-black';
          let icon = <CheckCircle2 className="w-4 h-4 text-black shrink-0" />;
          let tierLabel = 'VERIFIED FACT';

          if (item.tier === 'explanation') {
            badgeClass = 'bg-stone-100 text-black border-black';
            icon = <Info className="w-4 h-4 text-black shrink-0" />;
            tierLabel = 'LEGAL EXPLANATION';
          } else if (item.tier === 'possibility') {
            badgeClass = 'bg-stone-100 text-black border-black';
            icon = <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
            tierLabel = 'POTENTIAL COUNTER-ARGUMENT';
          } else if (item.tier === 'counsel_required') {
            badgeClass = 'bg-rose-600 text-white border-rose-600';
            icon = <Scale className="w-4 h-4 text-rose-600 shrink-0" />;
            tierLabel = 'PROFESSIONAL COUNSEL REQUIRED';
          } else if (item.tier === 'unsupported') {
            badgeClass = 'bg-black text-white border-black';
            icon = <ShieldAlert className="w-4 h-4 text-stone-400 shrink-0" />;
            tierLabel = 'UNSUPPORTED / MISSING PROOF';
          }

          return (
            <div key={index} className="pt-4 first:pt-0 flex items-start space-x-3.5">
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeClass}`}>
                    {tierLabel}
                  </span>
                  {item.confidenceScore !== undefined && (
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                      item.confidenceScore >= 0.8
                        ? 'text-black bg-stone-100 border-black'
                        : item.confidenceScore >= 0.6
                        ? 'text-black bg-stone-100 border-stone-400'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}>
                      {item.confidenceScore >= 0.8
                        ? 'Verified Support'
                        : item.confidenceScore >= 0.6
                        ? 'Supported'
                        : item.confidenceScore >= 0.4
                        ? 'Partially Supported'
                        : 'Unresolved'}
                    </span>
                  )}
                  {item.citation && (
                    <span className="text-[11px] font-mono text-stone-600">
                      SOURCE: {item.citation}
                    </span>
                  )}
                  {item.groundingRefIds && item.groundingRefIds.length > 0 && (
                    <span className="text-[10px] text-stone-500 font-mono">
                      REF: [{item.groundingRefIds.join(', ')}]
                    </span>
                  )}
                </div>
                <p className="text-xs text-black leading-relaxed font-normal">
                  {item.text}
                </p>
                {item.disclaimer && (
                  <p className="text-[11px] text-stone-600 italic border-l-2 border-rose-600 pl-2">
                    Note: {item.disclaimer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
