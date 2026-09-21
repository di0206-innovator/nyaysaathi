'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Matter } from '@/types/matter';
import { formatCurrencyINR, formatDateIndian } from '@/lib/utils';
import {
  MapPin,
  IndianRupee,
  RefreshCw,
  Printer,
  ArrowLeft,
  Calendar
} from 'lucide-react';

interface MatterHeaderProps {
  matter: Matter;
  onReanalyze?: () => Promise<void>;
}

export function MatterHeader({ matter, onReanalyze }: MatterHeaderProps) {
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleReanalyze = async () => {
    if (!onReanalyze) return;
    setIsReanalyzing(true);
    try {
      await onReanalyze();
    } finally {
      setIsReanalyzing(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    tenancy_housing: 'Tenancy & Rent Dispute',
    consumer_dispute: 'Consumer Protection (CPA 2019)',
    workplace_employment: 'Employment & Unpaid Wages',
    financial_cheque_bounce: 'Cheque Bounce (NI Act 138)',
    property_rera: 'Real Estate & RERA Handover',
    family_matrimonial: 'Family & Maintenance',
    cyber_fraud: 'Cyber Fraud & Financial Scam',
    police_criminal_grievance: 'Police e-FIR & Grievance',
    other: 'General Civil Matter'
  };

  return (
    <div className="bg-white border-b border-black py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back breadcrumb */}
        <div className="mb-4">
          <Link
            href="/matters"
            className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-black hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← RETURN TO DOCKET REGISTER</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-t border-black pt-4">
          {/* Title & Metadata */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider bg-black text-white">
                {categoryLabels[matter.category] || matter.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider bg-white text-black border border-black flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-rose-600 animate-pulse"></span>
                <span>STATUS: ACTION PLAN ACTIVE</span>
              </span>
              {matter.locationCity && (
                <span className="text-xs font-mono uppercase text-stone-600 flex items-center space-x-1 border border-stone-300 px-2 py-0.5">
                  <MapPin className="w-3 h-3 text-black" />
                  <span>JURISDICTION: {matter.locationCity}, {matter.locationState}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              {matter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-6 text-xs font-mono text-stone-600">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-black" />
                <span>RECORDED: {formatDateIndian(matter.createdAt)}</span>
              </span>
              {matter.claimAmount !== undefined && (
                <span className="flex items-center space-x-1 font-bold text-black">
                  <IndianRupee className="w-3.5 h-3.5 text-rose-600" />
                  <span>DISPUTE STAKE: {formatCurrencyINR(matter.claimAmount)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onReanalyze && (
              <button
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-black hover:text-white text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-black disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-rose-600' : ''}`} />
                <span>{isReanalyzing ? 'RE-COMPILING...' : 'RE-RUN AI GROUNDING'}</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-black hover:bg-rose-600 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-black"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT LEGAL DOSSIER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
