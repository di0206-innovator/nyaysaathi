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
    <div className="min-h-screen bg-stone-50/60 text-stone-900 selection:bg-amber-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center space-x-3">
              <BarChart3 className="w-7 h-7 text-amber-600" />
              <span>Pilot Product Analytics & Real-World Telemetry</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Empirical matter progression, time-to-first-useful-action, and real citizen feedback calibration.
            </p>
          </div>

          <button
            onClick={() => loadData()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
            aria-label="Refresh analytics dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* 1. Core Funnel KPIs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Longitudinal Matter Funnel (n = {funnel?.totalMatters || 0} Total Matters)
            </h2>
            <span className="text-[11px] text-stone-400">Measured from matter initiation to outcome</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">1. Intake</span>
              <div className="text-2xl sm:text-3xl font-black text-stone-900">
                {loading ? '...' : funnel?.totalMatters || 0}
              </div>
              <p className="text-[11px] text-stone-500">Matters logged & normalized</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">Base denominator (100%)</div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">2. Evidence Locker</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700">
                {loading ? '...' : funnel?.withDocuments || 0}
              </div>
              <p className="text-[11px] text-stone-500">Matters with verified OCR files</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((funnel.withDocuments || 0) / funnel.totalMatters) * 100)}% of intake` : 'n/a'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">3. Action Velocity</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700">
                {loading ? '...' : funnel?.withCompletedAction || 0}
              </div>
              <p className="text-[11px] text-stone-500">Matters with completed step</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((funnel.withCompletedAction || 0) / funnel.totalMatters) * 100)}% conversion` : 'n/a'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">4. Notice Dispatched</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700">
                {loading ? '...' : totalNoticesDispatched}
              </div>
              <p className="text-[11px] text-stone-500">Formal legal notices served</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((totalNoticesDispatched || 0) / funnel.totalMatters) * 100)}% served` : 'n/a'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">5. Total Resolved</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {loading ? '...' : funnel?.resolved || 0}
              </div>
              <p className="text-[11px] text-stone-500">Formally settled or closed</p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                {funnel?.totalMatters ? `${Math.round(((funnel.resolved || 0) / funnel.totalMatters) * 100)}% outcome rate` : 'n/a'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Core Metric: Time to First Useful Action */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-base text-stone-900">
                Core Product Metric: Time to First Useful Action
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-stone-100 text-stone-600">
              Sample size: n = {funnel?.timeToFirstUsefulActionMinutes?.sampleSize || 0} matters
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            <strong>Definition: </strong>
            Elapsed duration from matter creation (<code className="bg-stone-100 px-1 py-0.5 rounded">matter_created</code>)
            until the user completes their first executable step or sends a formal communication.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Median (p50)</span>
              <div className="text-2xl font-black text-stone-900">
                {loading ? '...' : `${funnel?.timeToFirstUsefulActionMinutes?.median || 0} min`}
              </div>
              <p className="text-[10px] text-stone-400">Typical citizen turnaround</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">75th Percentile (p75)</span>
              <div className="text-2xl font-black text-stone-900">
                {loading ? '...' : `${funnel?.timeToFirstUsefulActionMinutes?.p75 || 0} min`}
              </div>
              <p className="text-[10px] text-stone-400">Complex doc review window</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">95th Percentile (p95)</span>
              <div className="text-2xl font-black text-stone-900">
                {loading ? '...' : `${funnel?.timeToFirstUsefulActionMinutes?.p95 || 0} min`}
              </div>
              <p className="text-[10px] text-stone-400">Upper bound response latency</p>
            </div>
          </div>
        </div>

        {/* 3. Financial Recovery & Primary Launch Wedge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-stone-900 to-stone-850 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Coins className="w-6 h-6 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Financial Recovery & Stake Navigator
                </h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                INR Recovery Tracking
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1">
                <p className="text-xs text-stone-400 uppercase font-bold tracking-wider">Total Stake Disputed</p>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? '...' : formatCurrencyINR(claimAmount)}
                </div>
                <p className="text-[11px] text-stone-400">
                  Across n = {financial?.sampleSize || 0} total matters
                </p>
              </div>

              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Total Amount Recovered</p>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                  {loading ? '...' : formatCurrencyINR(amountRecovered)}
                </div>
                <p className="text-[11px] text-emerald-400/80">
                  From {financial?.resolvedCount || 0} verified resolved matters
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs text-stone-300 leading-relaxed">
              <strong className="text-amber-400">Primary Launch Wedge Focus: </strong>
              Urban tenancy security deposit disputes (Bengaluru, NCR, Mumbai, Hyderabad).
              Applicability is assessed under state tenancy legislation, Leave &amp; License clauses, and Indian Contract Act §73 wear-and-tear standards.
            </div>
          </div>

          {/* 4. Real Pilot Feedback Calibration (NO FAKE DEFAULTS) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-stone-900">Advocate & Citizen Feedback</h3>
            </div>
            <p className="text-xs text-stone-500">
              Empirical calibration signals collected directly from citizen matter dossiers and advocate evaluations.
            </p>

            {(!feedback || feedback.sampleSize === 0) ? (
              <div className="p-6 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-stone-400 mx-auto" />
                <p className="text-xs font-semibold text-stone-600">No pilot evaluations yet.</p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Evaluations submitted via the feedback widget on matter dossiers will dynamically populate this telemetry.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <div className="text-3xl font-black text-stone-900">
                    {feedback.averageRating} / 5.0
                  </div>
                  <p className="text-xs text-stone-500">
                    Sample size: n = {feedback.sampleSize} verified evaluations
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Period: {feedback.measurementPeriod}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Advocates Consulted</span>
                    <span className="font-bold text-stone-800">{feedback.advocateConsultedCount} reviews</span>
                  </div>
                  {Object.entries(feedback.categoryBreakdown || {}).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between py-1 border-b border-stone-100">
                      <span>{cat.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-stone-800">{count} reports</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Acquisition Source Attribution */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-stone-900">Acquisition Source Attribution</h3>
          </div>
          <p className="text-xs text-stone-500">
            Attribution of pilot signups and matter intake across distribution channels.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {Object.keys(acquisition).length === 0 ? (
              <p className="text-xs text-stone-400 col-span-full py-4 text-center">
                No acquisition source data logged yet.
              </p>
            ) : (
              Object.entries(acquisition).map(([src, count]) => (
                <div key={src} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    {src.replace(/_/g, ' ')}
                  </span>
                  <div className="text-lg font-bold text-stone-900">{count} matters</div>
                  <div className="text-[10px] text-stone-400">
                    {funnel?.totalMatters ? `${Math.round((count / funnel.totalMatters) * 100)}% share` : '100%'}
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
