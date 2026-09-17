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
    <div className="bg-white border-b border-stone-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back breadcrumb */}
        <div className="mb-4">
          <Link
            href="/matters"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Matters</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title & Metadata */}
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                {categoryLabels[matter.category] || matter.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Action Plan Ready</span>
              </span>
              {matter.locationCity && (
                <span className="text-xs text-stone-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{matter.locationCity}, {matter.locationState}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {matter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Created {formatDateIndian(matter.createdAt)}</span>
              </span>
              {matter.claimAmount !== undefined && (
                <span className="flex items-center space-x-1 font-semibold text-stone-900">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                  <span>Stake: {formatCurrencyINR(matter.claimAmount)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onReanalyze && (
              <button
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors border border-stone-300 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-amber-600' : ''}`} />
                <span>{isReanalyzing ? 'Updating Matter...' : 'Refresh AI Analysis'}</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors border border-stone-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
