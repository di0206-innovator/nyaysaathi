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
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Trust & Safety Transparency</h3>
              <p className="text-xs text-stone-300">
                NyaySaathi strictly separates verified facts, legal explanations, possibilities, lawyer-advised items, and unsupported claims.
              </p>
            </div>
          </div>

          {auditLog.length > 0 && (
            <button
              onClick={() => setShowAuditDrawer(!showAuditDrawer)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-300 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{showAuditDrawer ? 'Hide Safety Audit' : `View Audit Trail (${auditLog.length})`}</span>
            </button>
          )}
        </div>

        {/* 5-Tier Interactive Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-stone-700/60">
          <button
            onClick={() => setActiveFilter(activeFilter === 'fact' ? 'all' : 'fact')}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'fact'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                : 'bg-stone-800/80 hover:bg-stone-700/80 text-emerald-300 border border-emerald-900/50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Facts</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-900/60 text-[11px]">{factsCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'explanation' ? 'all' : 'explanation')}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'explanation'
                ? 'bg-blue-500 text-white font-bold shadow'
                : 'bg-stone-800/80 hover:bg-stone-700/80 text-blue-300 border border-blue-900/50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>2. Meaning</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-900/60 text-[11px]">{explCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'possibility' ? 'all' : 'possibility')}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'possibility'
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'bg-stone-800/80 hover:bg-stone-700/80 text-amber-300 border border-amber-900/50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3. Possibility</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-900/60 text-[11px]">{possCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'counsel_required' ? 'all' : 'counsel_required')}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'counsel_required'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'bg-stone-800/80 hover:bg-stone-700/80 text-rose-300 border border-rose-900/50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>4. Lawyer</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-900/60 text-[11px]">{counselCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'unsupported' ? 'all' : 'unsupported')}
            className={`col-span-2 sm:col-span-1 flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'unsupported'
                ? 'bg-purple-500 text-white font-bold shadow'
                : 'bg-stone-800/80 hover:bg-stone-700/80 text-purple-300 border border-purple-900/50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>5. Missing Proof</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-900/60 text-[11px]">{unsuppCount}</span>
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
      <div className="p-4 sm:p-5 divide-y divide-stone-100 space-y-3">
        {filteredItems.map((item, index) => {
          let badgeClass = 'tier-fact';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
          let tierLabel = 'Verified Fact';

          if (item.tier === 'explanation') {
            badgeClass = 'tier-explanation';
            icon = <Info className="w-4 h-4 text-blue-600 shrink-0" />;
            tierLabel = 'Legal Explanation';
          } else if (item.tier === 'possibility') {
            badgeClass = 'tier-possibility';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
            tierLabel = 'Potential Possibility / Counter-Argument';
          } else if (item.tier === 'counsel_required') {
            badgeClass = 'tier-counsel';
            icon = <Scale className="w-4 h-4 text-rose-600 shrink-0" />;
            tierLabel = 'Requires Professional Counsel';
          } else if (item.tier === 'unsupported') {
            badgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
            icon = <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />;
            tierLabel = 'Unsupported / Missing Proof';
          }

          return (
            <div key={index} className="pt-3 first:pt-0 flex items-start space-x-3">
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass}`}>
                    {tierLabel}
                  </span>
                  {item.confidenceScore !== undefined && (
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                      item.confidenceScore >= 0.8
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : item.confidenceScore >= 0.6
                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                        : item.confidenceScore >= 0.4
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-stone-700 bg-stone-100 border-stone-200'
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
                    <span className="text-[11px] text-stone-500 font-medium">
                      Source: {item.citation}
                    </span>
                  )}
                  {item.groundingRefIds && item.groundingRefIds.length > 0 && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      Ref: [{item.groundingRefIds.join(', ')}]
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-800 leading-relaxed font-normal">
                  {item.text}
                </p>
                {item.disclaimer && (
                  <p className="text-[11px] text-stone-500 italic">
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
