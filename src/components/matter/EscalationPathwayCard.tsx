'use client';

import React from 'react';
import { EscalationRoute } from '@/types/matter';
import {
  PhoneCall,
  Scale,
  ArrowUpRight
} from 'lucide-react';

interface EscalationPathwayCardProps {
  routes: EscalationRoute[];
}

export function EscalationPathwayCard({ routes }: EscalationPathwayCardProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="mb-6 pb-3 border-b border-stone-100">
          <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-700" />
            <span>Escalation Pathways & Government Portals</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified Indian dispute resolution routes, legal aid centers, and online e-filing mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 space-y-3 hover:border-amber-400 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-stone-900 leading-snug">{route.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    {route.costEstimate}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {route.description}
                </p>

                {route.eligibilityDescription && (
                  <div className="text-[11px] text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                    <strong className="text-stone-900">Eligibility: </strong>
                    {route.eligibilityDescription}
                  </div>
                )}

                {/* Steps to apply */}
                {route.stepsToApply && route.stepsToApply.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-stone-700 uppercase">How to Proceed:</span>
                    <ol className="text-xs text-stone-600 space-y-1 list-decimal list-inside">
                      {route.stepsToApply.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center gap-2">
                {route.officialPortalUrl && (
                  <a
                    href={route.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
                  >
                    <span>Visit Official Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {route.tollFreeNumber && (
                  <a
                    href={`tel:${route.tollFreeNumber.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call {route.tollFreeNumber}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
