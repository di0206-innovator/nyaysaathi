'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Coins,
  MessageSquare,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

interface AnalyticsData {
  funnel: {
    totalMatters: number;
    withDocuments: number;
    analyzed: number;
    withCompletedAction: number;
    noticesDispatched: number;
    resolved: number;
    timeToFirstUsefulActionMinutes: {
      median: number;
      p75: number;
      p95: number;
      sampleSize: number;
    };
  };
  feedback: {
    totalSubmissions: number;
    averageRating: number;
    sampleSize: number;
    measurementPeriod: string;
    categoryBreakdown: Record<string, number>;
    correctionBreakdown: Record<string, number>;
    advocateConsultedCount: number;
  };
  acquisition: Record<string, number>;
  financial: {
    totalDisputed: number;
    totalRecovered: number;
    resolvedCount: number;
    sampleSize: number;
  };
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch {
      // Fallback state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/analytics')
      .then(res => res.json())
      .then(json => {
        if (active && json.success && json.data) {
          setData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const funnel = data?.funnel;
  const feedback = data?.feedback;
  const financial = data?.financial;
  const acquisition = data?.acquisition || {};
  const totalNoticesDispatched = funnel?.noticesDispatched || 0;
  const amountRecovered = financial?.totalRecovered || 0;
  const claimAmount = financial?.totalDisputed || 0;

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header - Swiss Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#0A0A0A]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 font-mono text-xs font-bold uppercase text-rose-600 hover:text-rose-700 tracking-wider mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dossier Index</span>
            </Link>
            <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
              <BarChart3 className="w-4 h-4 text-rose-600" />
              <span>§ 00 // EMPIRICAL TELEMETRY REGISTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A] mt-1">
              Pilot Analytics &amp; Outcomes
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-mono mt-0.5 uppercase">
              Matter velocity, time-to-first-useful-action, and precision feedback telemetry.
            </p>
          </div>

          <button
            onClick={() => loadData()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-[#0A0A0A] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors self-start sm:self-auto"
            aria-label="Refresh analytics dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Register</span>
          </button>
        </div>

        {/* 1. Core Funnel KPIs - Swiss Grid */}
        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between border-b border-stone-300 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              01 // LONGITUDINAL MATTER PIPELINE (n = {funnel?.totalMatters || 0} DOSSIERS)
            </h2>
            <span className="text-[11px] text-stone-500 uppercase">MEASURED FROM CREATION TO RESOLUTION</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 border border-[#0A0A0A] divide-x divide-y lg:divide-y-0 divide-[#0A0A0A] bg-white">
            <div className="p-5 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">[STAGE 01: INTAKE]</span>
              <div className="text-3xl font-black text-[#0A0A0A]">
                {loading ? '...' : funnel?.totalMatters || 0}
              </div>
              <p className="text-xs text-stone-600 font-sans">Matters logged</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">DENOMINATOR (100%)</div>
            </div>

            <div className="p-5 space-y-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">[STAGE 02: EVIDENCE]</span>
              <div className="text-3xl font-black text-rose-600">
                {loading ? '...' : funnel?.withDocuments || 0}
              </div>
              <p className="text-xs text-stone-600 font-sans">Verified OCR exhibits</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((funnel.withDocuments || 0) / funnel.totalMatters) * 100)}% CONVERSION` : 'N/A'}
              </div>
            </div>

            <div className="p-5 space-y-1">
              <span className="text-[10px] font-bold text-stone-900 uppercase tracking-widest">[STAGE 03: VELOCITY]</span>
              <div className="text-3xl font-black text-[#0A0A0A]">
                {loading ? '...' : funnel?.withCompletedAction || 0}
              </div>
              <p className="text-xs text-stone-600 font-sans">First step completed</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((funnel.withCompletedAction || 0) / funnel.totalMatters) * 100)}% CONVERSION` : 'N/A'}
              </div>
            </div>

            <div className="p-5 space-y-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">[STAGE 04: NOTICES]</span>
              <div className="text-3xl font-black text-rose-600">
                {loading ? '...' : totalNoticesDispatched}
              </div>
              <p className="text-xs text-stone-600 font-sans">Speed Post notices served</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((totalNoticesDispatched || 0) / funnel.totalMatters) * 100)}% DISPATCH RATE` : 'N/A'}
              </div>
            </div>

            <div className="p-5 space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">[STAGE 05: RESOLVED]</span>
              <div className="text-3xl font-black text-emerald-700">
                {loading ? '...' : funnel?.resolved || 0}
              </div>
              <p className="text-xs text-stone-600 font-sans">Settled or closed</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((funnel.resolved || 0) / funnel.totalMatters) * 100)}% OUTCOME` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Core Metric: Time to First Useful Action */}
        <div className="bg-white border-2 border-[#0A0A0A] p-6 space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-sm uppercase text-[#0A0A0A] tracking-wider">
                02 // CORE VELOCITY: TIME TO FIRST USEFUL ACTION
              </h2>
            </div>
            <span className="text-xs bg-stone-100 px-2 py-0.5 border border-stone-300">
              SAMPLE: n = {funnel?.timeToFirstUsefulActionMinutes?.sampleSize || 0} MATTERS
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            <strong>Metric Definition: </strong>
            Elapsed duration from matter dossier creation until the user executes their first procedural step or serves formal correspondence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#0A0A0A] divide-y sm:divide-y-0 sm:divide-x divide-[#0A0A0A] text-center">
            <div className="p-4 bg-[#FBFBF9] space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">[MEDIAN // P50]</span>
              <div className="text-3xl font-black text-[#0A0A0A]">
                {loading ? '...' : `${funnel?.timeToFirstUsefulActionMinutes?.median || 0} MIN`}
              </div>
              <p className="text-[10px] text-stone-500 uppercase">TYPICAL CITIZEN TURNAROUND</p>
            </div>

            <div className="p-4 bg-[#FBFBF9] space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">[75TH PERCENTILE // P75]</span>
              <div className="text-3xl font-black text-[#0A0A0A]">
                {loading ? '...' : `${funnel?.timeToFirstUsefulActionMinutes?.p75 || 0} MIN`}
              </div>
              <p className="text-[10px] text-stone-500 uppercase">COMPLEX EVIDENCE AUDIT</p>
            </div>

            <div className="p-4 bg-[#FBFBF9] space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">[95TH PERCENTILE // P95]</span>
              <div className="text-3xl font-black text-[#0A0A0A]">
                {loading ? '...' : `${funnel?.timeToFirstUsefulActionMinutes?.p95 || 0} MIN`}
              </div>
              <p className="text-[10px] text-stone-500 uppercase">UPPER BOUND LATENCY</p>
            </div>
          </div>
        </div>

        {/* 3. Financial Recovery & Primary Launch Wedge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="md:col-span-2 bg-[#0A0A0A] text-white p-6 sm:p-8 border-2 border-black space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Coins className="w-5 h-5 text-rose-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  03 // FINANCIAL CLAIM &amp; RECOVERY REGISTER
                </h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                INR TRACKING
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-stone-950 border border-stone-800 space-y-1">
                <p className="text-[11px] text-stone-400 uppercase font-bold tracking-widest">TOTAL STAKE DISPUTED</p>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? '...' : formatCurrencyINR(claimAmount)}
                </div>
                <p className="text-[10px] text-stone-400 uppercase">
                  ACROSS n = {financial?.sampleSize || 0} TOTAL MATTERS
                </p>
              </div>

              <div className="p-4 bg-stone-950 border border-emerald-900/60 space-y-1">
                <p className="text-[11px] text-emerald-400 uppercase font-bold tracking-widest">TOTAL AMOUNT RECOVERED</p>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {loading ? '...' : formatCurrencyINR(amountRecovered)}
                </div>
                <p className="text-[10px] text-emerald-500 uppercase">
                  FROM {financial?.resolvedCount || 0} VERIFIED OUTCOMES
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 text-xs text-stone-300 leading-relaxed font-sans">
              <strong className="text-white">PRIMARY ENTRY WEDGE (Primary Launch Wedge Focus): </strong>
              Urban tenancy security deposit disputes across Bengaluru, Mumbai, Delhi-NCR, and Hyderabad.
              Remedies are determined under state rent acts, Leave &amp; License provisions, and Indian Contract Act §73 wear-and-tear standards.
            </div>
          </div>

          {/* 4. Real Pilot Feedback Calibration */}
          <div className="bg-white border-2 border-[#0A0A0A] p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
              <MessageSquare className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0A0A0A]">
                04 // CITIZEN &amp; ADVOCATE CALIBRATION
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-sans">
              Empirical calibration signals collected directly from matter evaluations.
            </p>

            {(!feedback || feedback.sampleSize === 0) ? (
              <div className="p-6 bg-[#FBFBF9] border border-dashed border-stone-300 text-center space-y-2 font-mono">
                <AlertCircle className="w-6 h-6 text-stone-400 mx-auto" />
                <p className="text-xs font-bold text-stone-800 uppercase">No pilot evaluations yet.</p>
                <p className="text-[10px] text-stone-500 leading-relaxed uppercase">
                  Evaluations submitted via the feedback widget on matter dossiers will dynamically populate this telemetry.
                </p>
              </div>
            ) : (
              <div className="space-y-4 font-mono">
                <div className="p-4 bg-[#FBFBF9] border border-stone-300 text-center space-y-1">
                  <div className="text-3xl font-black text-[#0A0A0A]">
                    {feedback.averageRating} / 5.0
                  </div>
                  <p className="text-xs text-stone-600 uppercase">
                    SAMPLE: n = {feedback.sampleSize} VERIFIED EVALUATIONS
                  </p>
                  <p className="text-[10px] text-stone-400 uppercase">
                    PERIOD: {feedback.measurementPeriod}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="uppercase">ADVOCATES CONSULTED</span>
                    <span className="font-bold text-[#0A0A0A]">{feedback.advocateConsultedCount}</span>
                  </div>
                  {Object.entries(feedback.categoryBreakdown || {}).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between py-1 border-b border-stone-200">
                      <span className="uppercase">{cat.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-[#0A0A0A]">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Acquisition Source Attribution */}
        <div className="bg-white border-2 border-[#0A0A0A] p-6 space-y-4 font-mono">
          <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
            <Compass className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0A0A0A]">
              05 // DISTRIBUTION &amp; ACQUISITION ATTRIBUTION
            </h3>
          </div>
          <p className="text-xs text-stone-600 font-sans">
            Attribution of pilot registrations across community, student union, and legal clinic channels.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {Object.keys(acquisition).length === 0 ? (
              <p className="text-xs text-stone-400 col-span-full py-4 text-center uppercase">
                No acquisition source data logged yet.
              </p>
            ) : (
              Object.entries(acquisition).map(([src, count]) => (
                <div key={src} className="p-3.5 border border-stone-300 bg-[#FBFBF9] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider truncate block">
                    {src.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xl font-bold text-[#0A0A0A]">{count} DOSSIERS</div>
                  <div className="text-[10px] text-stone-500">
                    {funnel?.totalMatters ? `${Math.round((count / funnel.totalMatters) * 100)}% SHARE` : '100%'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
