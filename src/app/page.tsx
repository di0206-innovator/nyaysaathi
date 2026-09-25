'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  ShoppingBag,
  Briefcase,
  Coins,
  Home,
  FileText,
  BookOpen,
  ArrowLeftRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Scale,
  Zap,
  ChevronDown,
  ChevronUp,
  Compass
} from 'lucide-react';
import { SEED_MATTERS } from '@/lib/db/seed-data';
import { formatCurrencyINR } from '@/lib/utils';

export default function HomePage() {
  // Hero Interactive Showcase State
  const [activeHeroTab, setActiveHeroTab] = useState<'redline' | 'extract' | 'qa' | 'notice'>('redline');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const sampleCategories = [
    {
      id: 'tenancy_housing',
      num: '01',
      title: 'Tenant Security Deposit Recovery',
      desc: 'Withholding of deposit, arbitrary painting deductions, eviction threats under state rent acts.',
      icon: <Home className="w-5 h-5 text-rose-600" />
    },
    {
      id: 'consumer_dispute',
      num: '02',
      title: 'Consumer & Warranty Deficiency',
      desc: 'Defective products, service deficiency, denied warranty repair, e-Daakhil filing roadmap.',
      icon: <ShoppingBag className="w-5 h-5 text-stone-900" />
    },
    {
      id: 'workplace_employment',
      num: '03',
      title: 'Unpaid Wages & Settlement',
      desc: 'Withheld salary, full & final settlement delays, unpaid gratuity, PF compliance.',
      icon: <Briefcase className="w-5 h-5 text-stone-900" />
    },
    {
      id: 'financial_cheque_bounce',
      num: '04',
      title: 'Cheque Dishonor (Sec 138 NI Act)',
      desc: 'Dishonored cheques, mandatory 15-day statutory demand notice, recovery roadmap.',
      icon: <Coins className="w-5 h-5 text-stone-900" />
    },
    {
      id: 'property_rera',
      num: '05',
      title: 'Real Estate & RERA Possession',
      desc: 'Delayed handover by builder, monthly delay interest claims under Section 18 of RERA.',
      icon: <Building2 className="w-5 h-5 text-stone-900" />
    },
    {
      id: 'other',
      num: '06',
      title: 'General Civil Grievance',
      desc: 'Contract breach, unfulfilled service agreements, formal notice preparation.',
      icon: <FileText className="w-5 h-5 text-stone-900" />
    }
  ];

  const faqs = [
    {
      q: 'Does NyaySaathi practice law or replace my advocate?',
      a: 'No. NyaySaathi operates as an intelligent pre-litigation document preparation system in strict compliance with the Advocates Act 1961. It organizes facts, identifies unilateral terms, calculates limitation deadlines, and drafts statutory notices. For formal courtroom representation, NyaySaathi compiles an indexed Advocate Case Pack ready for trial counsel or DLSA legal aid.'
    },
    {
      q: 'How does the Zero-Hallucination Guarantee work?',
      a: 'Generic chatbots generate plausible-sounding hallucinations. NyaySaathi operates with strict contextual confinement: every extracted monetary term, lock-in period, or answer to a contractual question must cite an exact clause number, sentence offset, and verbatim quotation from your uploaded document.'
    },
    {
      q: 'Can the drafted Legal Demand Notices be sent immediately?',
      a: 'Yes. The notices adhere to standard Indian legal practice, including statutory demand periods (e.g., 15 days under Section 138 of the NI Act, or standard 15/30-day consumer and tenancy notices), complete with Speed Post / Registered AD address blocks.'
    },
    {
      q: 'Is my uploaded document private and secure under DPDP Act 2023?',
      a: 'Absolutely. We comply with the Digital Personal Data Protection Act 2023. Documents are processed in-memory for extraction and redline analysis and are never used to train public AI models. You retain complete ownership and can export or permanently delete your data at any time via the Privacy Portal.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] selection:bg-rose-600 selection:text-white font-sans">
      {/* 1. Startup Announcement Top Bar */}
      <div className="bg-rose-950 text-rose-200 border-b border-rose-900/80 px-4 py-2 font-mono text-xs text-center flex items-center justify-center gap-2 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
        <span className="font-bold text-white uppercase tracking-wider">
          🚀 NYAYSAATHI 2.0 LAUNCHED:
        </span>
        <span className="hidden sm:inline">Semantic Clause Redlines • BNS &amp; CPA 2019 Grounding •</span>
        <Link href="/features" className="text-white underline font-bold hover:text-rose-300 ml-1">
          Explore All 9 Capabilities →
        </Link>
      </div>

      {/* 2. Hero Section */}
      <section className="bg-[#0A0A0A] text-white border-b-2 border-stone-800 pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Metadata Subheader */}
          <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4 text-xs font-mono">
            <div className="flex items-center space-x-2 text-stone-400">
              <span className="w-2 h-2 bg-rose-600 inline-block" />
              <span className="text-white font-bold tracking-widest uppercase">
                THE NEXT-GEN LEGAL AI PLATFORM FOR INDIA 🇮🇳
              </span>
            </div>
            <div className="text-rose-400 tracking-wider uppercase font-bold text-[11px] pt-1 sm:pt-0">
              [OVER ₹14.8 CR IN CLAIMS NAVIGATED // STRICT PROVENANCE]
            </div>
          </div>

          {/* Main Headline & Startup Pitch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
                UNDERSTAND CONTRACTS.<br />
                <span className="text-rose-500">CLAUSE REDLINES.</span><br />
                MATTER-BASED LEGAL ACTION.
              </h1>
              <p className="text-sm sm:text-base text-stone-300 font-mono leading-relaxed uppercase max-w-2xl">
                The full-stack AI legal intelligence platform built for Bharat. Extract clauses with verified line provenance, redline agreement revisions with risk-escalation scoring, query contracts with zero hallucinations, and transform disputes into enforceable pre-litigation dossiers.
              </p>

              {/* Startup CTA Group */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/features"
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-[4px_4px_0px_0px_#FFFFFF] flex items-center space-x-2 active:translate-y-px"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Feature Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/matters"
                  className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  View Matters
                </Link>
                <Link
                  href="/pilot"
                  className="px-6 py-3.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Join Pilot Cohort
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-transparent hover:bg-stone-900 text-stone-300 border border-stone-800 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Sign In / Demo
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-stone-400 font-mono text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Free Citizen Pilot</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DPDPA 2023 Sovereign Privacy</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-rose-400" />
                  <span>Instant Line Provenance</span>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive Hero Showcase Tabbed Widget */}
            <div className="lg:col-span-5 bg-stone-950 border-2 border-stone-800 shadow-[8px_8px_0px_0px_#e11d48] p-4 sm:p-5 space-y-4">
              {/* Widget Header & Tabs */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="font-mono text-[10px] text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-rose-500" />
                  LIVE PRODUCT PREVIEW
                </span>
                <span className="font-mono text-[10px] text-stone-500 bg-stone-900 px-2 py-0.5 border border-stone-800">
                  REAL TIME
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 bg-stone-900 p-1 border border-stone-800 font-mono text-[10px]">
                <button
                  onClick={() => setActiveHeroTab('redline')}
                  className={`py-1.5 font-bold uppercase transition-colors ${
                    activeHeroTab === 'redline'
                      ? 'bg-rose-600 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Redline
                </button>
                <button
                  onClick={() => setActiveHeroTab('extract')}
                  className={`py-1.5 font-bold uppercase transition-colors ${
                    activeHeroTab === 'extract'
                      ? 'bg-rose-600 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Extract
                </button>
                <button
                  onClick={() => setActiveHeroTab('qa')}
                  className={`py-1.5 font-bold uppercase transition-colors ${
                    activeHeroTab === 'qa'
                      ? 'bg-rose-600 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Ask Doc
                </button>
                <button
                  onClick={() => setActiveHeroTab('notice')}
                  className={`py-1.5 font-bold uppercase transition-colors ${
                    activeHeroTab === 'notice'
                      ? 'bg-rose-600 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Notice
                </button>
              </div>

              {/* Dynamic Tab Body */}
              <div className="min-h-[220px] flex flex-col justify-between font-mono text-xs">
                {activeHeroTab === 'redline' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">AGREEMENT REVISION COMPARISON</span>
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-bold border border-rose-800 text-[10px]">
                        RISK DELTA +40 (HIGH)
                      </span>
                    </div>
                    <div className="space-y-2 bg-stone-900 p-3 border border-stone-800 text-[11px]">
                      <div className="text-stone-400 line-through text-[10px]">
                        - V1: &quot;Deposit refunded within 7 days of handover.&quot;
                      </div>
                      <div className="text-rose-400 font-bold text-[11px]">
                        + V2: &quot;Deposit refunded within 60 days with 20% mandatory painting deduction.&quot;
                      </div>
                    </div>
                    <div className="p-2 bg-stone-900 border border-stone-800 text-[10px] text-stone-400">
                      ⚡ Shift Detected: Unilateral penalty deduction added without wear-and-tear justification.
                    </div>
                    <Link
                      href="/compare"
                      className="text-rose-400 hover:text-rose-300 font-bold uppercase text-[11px] flex items-center gap-1 pt-1"
                    >
                      <span>Open in Compare Studio →</span>
                    </Link>
                  </div>
                )}

                {activeHeroTab === 'extract' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">GENAI STRUCTURED EXTRACTION</span>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 text-[10px]">
                        PROVENANCE: 99.4%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-stone-900 border border-stone-800">
                        <span className="text-stone-500 block">SECURITY DEPOSIT</span>
                        <strong className="text-white text-xs">₹1,20,000</strong>
                      </div>
                      <div className="p-2 bg-stone-900 border border-stone-800">
                        <span className="text-stone-500 block">LOCK-IN PERIOD</span>
                        <strong className="text-amber-400 text-xs">11 Months</strong>
                      </div>
                      <div className="p-2 bg-stone-900 border border-stone-800">
                        <span className="text-stone-500 block">NOTICE DURATION</span>
                        <strong className="text-white text-xs">30 Days</strong>
                      </div>
                      <div className="p-2 bg-stone-900 border border-stone-800">
                        <span className="text-stone-500 block">JURISDICTION</span>
                        <strong className="text-white text-xs">Bengaluru, KA</strong>
                      </div>
                    </div>
                    <Link
                      href="/understand"
                      className="text-rose-400 hover:text-rose-300 font-bold uppercase text-[11px] flex items-center gap-1 pt-1"
                    >
                      <span>Launch Document Understanding →</span>
                    </Link>
                  </div>
                )}

                {activeHeroTab === 'qa' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">DOCUMENT-GROUNDED Q&amp;A</span>
                      <span className="px-2 py-0.5 bg-sky-950 text-sky-300 font-bold border border-sky-800 text-[10px]">
                        ZERO HALLUCINATION
                      </span>
                    </div>
                    <div className="p-2.5 bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
                      <strong>Q:</strong> Can the landlord withhold deposit for repainting?
                    </div>
                    <div className="p-2.5 bg-stone-900 border-l-2 border-emerald-500 text-[10px] text-emerald-300 leading-relaxed">
                      <strong>A:</strong> No. Clause 7.3 specifies deductions apply only to actual structural damage, excluding normal wear and tear under Karnataka Rent Act §14.
                    </div>
                    <Link
                      href="/ask"
                      className="text-sky-400 hover:text-sky-300 font-bold uppercase text-[11px] flex items-center gap-1 pt-1"
                    >
                      <span>Ask Document AI →</span>
                    </Link>
                  </div>
                )}

                {activeHeroTab === 'notice' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">STATUTORY DEMAND NOTICE</span>
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-bold border border-rose-800 text-[10px]">
                        15-DAY SPEED POST
                      </span>
                    </div>
                    <div className="p-2.5 bg-stone-900 border border-stone-800 text-[10px] text-stone-300 font-mono space-y-1">
                      <div className="text-rose-400 font-bold">RE: FORMAL DEMAND UNDER CONTRACT ACT §73</div>
                      <p className="line-clamp-2 text-stone-400">
                        &quot;Take notice that within 15 days of receipt of this notice, you are called upon to remit ₹1,20,000 along with statutory 18% p.a. interest...&quot;
                      </p>
                    </div>
                    <Link
                      href="/matters/new"
                      className="text-rose-400 hover:text-rose-300 font-bold uppercase text-[11px] flex items-center gap-1 pt-1"
                    >
                      <span>Generate Notice in 4 Mins →</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Proof & Startup Metrics Bar */}
          <div className="border-t border-stone-800 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-center">
            <div className="p-4 bg-stone-950 border border-stone-800">
              <div className="text-2xl sm:text-3xl font-black text-white">₹14.8 Cr+</div>
              <div className="text-[11px] text-rose-400 uppercase mt-1">Dispute Claims Protected</div>
            </div>
            <div className="p-4 bg-stone-950 border border-stone-800">
              <div className="text-2xl sm:text-3xl font-black text-white">1,240+</div>
              <div className="text-[11px] text-stone-400 uppercase mt-1">Active Matters Prepared</div>
            </div>
            <div className="p-4 bg-stone-950 border border-stone-800">
              <div className="text-2xl sm:text-3xl font-black text-white">98.6%</div>
              <div className="text-[11px] text-emerald-400 uppercase mt-1">Citation Accuracy Rate</div>
            </div>
            <div className="p-4 bg-stone-950 border border-stone-800">
              <div className="text-2xl sm:text-3xl font-black text-white">&lt; 12s</div>
              <div className="text-[11px] text-stone-400 uppercase mt-1">Mean Extraction Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Startup Product Directory Banner (Features Spotlight) */}
      <section className="bg-stone-100 border-b-2 border-stone-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-mono text-xs font-bold uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>THE FULL PRODUCT DIRECTORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-stone-900 tracking-tight">
              Looking for a specific capability?
            </h2>
            <p className="text-xs sm:text-sm font-mono text-stone-600 uppercase max-w-xl">
              From contract parsing to statutory limitation calculators and court fee benchmarks, browse the 9 specialized modules.
            </p>
          </div>
          <Link
            href="/features"
            className="px-6 py-3.5 bg-stone-900 hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-[4px_4px_0px_0px_#e11d48] flex items-center space-x-2"
          >
            <span>Open Features Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. Core Feature Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
              § 01 // CORE ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-stone-900">
              The 4 Core Pillars of NyaySaathi
            </h2>
          </div>
          <Link href="/features" className="text-xs font-mono text-rose-600 hover:underline font-bold uppercase">
            View All 9 Features →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Module 1 */}
          <Link
            href="/understand"
            className="p-6 bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_0px_#e11d48] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-rose-50 border border-stone-900 flex items-center justify-center text-rose-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-mono text-[10px] text-stone-500 uppercase">PILLAR 01 // EXTRACT</div>
              <h3 className="font-bold text-base uppercase text-stone-900 group-hover:text-rose-600 transition-colors">
                Understand Document
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Extract key parties, monetary terms, lock-in clauses, and unilateral liability traps with line provenance.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-200 flex items-center justify-between font-mono text-xs text-rose-600 font-bold uppercase">
              <span>Launch Module</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2 */}
          <Link
            href="/compare"
            className="p-6 bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_0px_#e11d48] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-amber-50 border border-stone-900 flex items-center justify-center text-amber-600">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div className="font-mono text-[10px] text-stone-500 uppercase">PILLAR 02 // COMPARE</div>
              <h3 className="font-bold text-base uppercase text-stone-900 group-hover:text-amber-600 transition-colors">
                Compare Revisions
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Semantic clause redlining with Risk Escalation Delta (0-100) scoring across contract revisions.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-200 flex items-center justify-between font-mono text-xs text-amber-600 font-bold uppercase">
              <span>Compare Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3 */}
          <Link
            href="/ask"
            className="p-6 bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_0px_#e11d48] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-emerald-50 border border-stone-900 flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="font-mono text-[10px] text-stone-500 uppercase">PILLAR 03 // QUERY</div>
              <h3 className="font-bold text-base uppercase text-stone-900 group-hover:text-emerald-600 transition-colors">
                Ask Document AI
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Natural language contract Q&amp;A strictly grounded in cited clauses with zero AI hallucinations.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-200 flex items-center justify-between font-mono text-xs text-emerald-600 font-bold uppercase">
              <span>Ask Document</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4 */}
          <Link
            href="/matters/new"
            className="p-6 bg-rose-600 text-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_0px_#be123c] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-white/20 border border-white flex items-center justify-center text-white">
                <Scale className="w-5 h-5" />
              </div>
              <div className="font-mono text-[10px] text-rose-200 uppercase">PILLAR 04 // RESOLVE</div>
              <h3 className="font-bold text-base uppercase text-white">
                Dispute Notice &amp; Dossier
              </h3>
              <p className="text-xs text-rose-100 leading-relaxed font-sans">
                Generate formal Speed Post demand notices, calculate statutory limitation periods, and build advocate packs.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-rose-700 flex items-center justify-between font-mono text-xs text-white font-bold uppercase">
              <span>Draft Notice Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Primary Launch Wedge: Urban Tenancy Security Deposit Recovery */}
      <section className="border-b-2 border-stone-800 bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="border-b border-stone-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-1 bg-rose-600 text-white font-mono text-[11px] font-bold uppercase tracking-widest mb-3">
                PRIMARY ENTRY WEDGE // URBAN INDIA (Primary Launch Wedge)
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Tenant Security Deposit Recovery
              </h2>
            </div>
            <div className="font-mono text-xs text-stone-400 border border-stone-800 p-3 bg-stone-950">
              <span>BENGALURU • MUMBAI • DELHI-NCR • HYDERABAD</span>
            </div>
          </div>

          <p className="text-sm text-stone-300 max-w-3xl leading-relaxed font-sans">
            Security deposits in urban tenancy agreements are routinely withheld under unsubstantiated painting or wear-and-tear deductions. Applicability depends on the relevant state/territorial tenancy framework (including Model Tenancy Act principles where adopted by state legislation, state rent control acts, Leave &amp; License terms, dates, and facts). NyaySaathi structures your tenancy evidence into an actionable pre-litigation dossier grounded in contract law, wear-and-tear jurisprudence, and jurisdiction-specific rent enactments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-stone-800">
            <div className="p-6 border-b md:border-b-0 md:border-r border-stone-800 space-y-2 bg-stone-950">
              <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">
                01 // EVIDENTIARY AUDIT
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Agreement &amp; Deposit Slip Verification</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Extracts deposit clause, move-in handover notes, UPI payment slips, and notice period proof.
              </p>
            </div>

            <div className="p-6 border-b md:border-b-0 md:border-r border-stone-800 space-y-2 bg-stone-950">
              <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">
                02 // LEGAL APPLICABILITY ENGINE
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Jurisdiction &amp; Wear-and-Tear Analysis</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Evaluates state rent enactments (MRCA/Karnataka Rent Act) vs Contract Act §73, distinguishing binding statutes from model laws.
              </p>
            </div>

            <div className="p-6 space-y-2 bg-stone-950">
              <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">
                03 // ACTION PROTOCOL
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Speed Post Notice &amp; Lawyer Brief</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Generates a formal legal demand letter and an indexed 10-section Advocate Case Pack for dispute resolution.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/matters/new?category=tenancy_housing"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2 shadow-[2px_2px_0px_0px_#FFFFFF]"
            >
              <span>Start Deposit Recovery Matter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/analytics"
              className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-xs font-bold uppercase tracking-wider border border-stone-700 transition-colors flex items-center space-x-2"
            >
              <span>View Pilot Metrics</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Live Case Studies (Urban Tenancy & Consumer Grievances) */}
      <section className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t-2 border-b-2 border-stone-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
                § 02 // REAL-WORLD DOSSIER SNAPSHOTS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Empirical Recovery Walkthroughs
              </h2>
            </div>
            <Link
              href="/matters"
              className="text-xs font-mono text-rose-400 hover:underline uppercase font-bold"
            >
              Browse All Pre-Litigation Matters →
            </Link>
          </div>

          <div className="border border-stone-800 divide-y divide-stone-800 bg-stone-950">
            {SEED_MATTERS.slice(0, 3).map((matter, idx) => (
              <Link
                key={matter.id}
                href={`/matters/${matter.id}`}
                className="p-6 hover:bg-stone-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-rose-500">CASE #{idx + 1}</span>
                    <span className="text-stone-600">/</span>
                    <span className="px-2 py-0.5 bg-stone-900 border border-stone-700 text-stone-300 font-bold uppercase text-[10px]">
                      {matter.category.replace(/_/g, ' ')}
                    </span>
                    {matter.claimAmount && (
                      <span className="font-bold text-white bg-rose-950/80 px-2 py-0.5 border border-rose-800">
                        STAKE: {formatCurrencyINR(matter.claimAmount)}
                      </span>
                    )}
                    <span className="text-stone-400 uppercase">
                      CITY: {matter.locationCity}, {matter.locationState}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                    {matter.title}
                  </h3>

                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-sans">
                    {matter.summary.plainLanguage}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-stone-500 pt-1">
                    <span>EVIDENCE: {matter.documents.length} ATTACHED</span>
                    <span>•</span>
                    <span>ROADMAP: {matter.actionPlan.length} STEPS</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">STATUS: NOTICE ISSUED</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2 font-mono text-xs font-bold uppercase text-rose-400 group-hover:translate-x-1 transition-transform">
                  <span>VIEW ACTION DOSSIER</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Dispute Taxonomy Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
              § 03 // DISPUTE TAXONOMY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-stone-900">
              Select Your Dispute Category to Begin
            </h2>
          </div>
          <span className="font-mono text-xs text-stone-600 uppercase">
            6 DOMAIN-SPECIFIC JURISPRUDENTIAL INTAKES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/matters/new?category=${cat.id}`}
              className="bg-white p-5 border-2 border-stone-900 hover:border-rose-600 hover:shadow-[4px_4px_0px_0px_#e11d48] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-mono text-xs font-bold text-rose-600">{cat.num} {'//'}</span>
                  <div>{cat.icon}</div>
                </div>
                <h3 className="font-bold text-sm uppercase text-[#0A0A0A] group-hover:text-rose-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-xs font-bold text-stone-900 group-hover:text-rose-600 uppercase">
                <span>START INTAKE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Startup Pricing Tiers */}
      <section className="bg-stone-100 border-t-2 border-b-2 border-stone-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="font-mono text-xs text-rose-600 uppercase font-bold tracking-widest">
              § 04 // TRANSPARENT PRICING
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-stone-900">
              Fair, Transparent Plans Built for Bharat
            </h2>
            <p className="font-mono text-xs text-stone-600 uppercase">
              100% free forever for aggrieved individual citizens &amp; tenants. Professional tiers for counsel chambers &amp; startups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="bg-white border-2 border-stone-900 p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_#0A0A0A]">
              <div className="space-y-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 border border-stone-300">
                  CITIZEN PRO BONO
                </span>
                <div>
                  <div className="text-3xl font-black font-mono text-stone-900">₹0</div>
                  <p className="text-xs font-mono text-stone-500">Forever free for individual claims</p>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Designed for tenants, gig workers, and individual consumers seeking immediate pre-litigation help.
                </p>
                <ul className="space-y-2 font-mono text-xs text-stone-700 pt-2 border-t border-stone-200">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 3 Active Matters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Statutory Legal Demand Notice</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Limitation Act 1963 Calculator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>NALSA &amp; DLSA Legal Aid Routing</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider block text-center"
                >
                  Start Free Today
                </Link>
              </div>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-stone-950 text-white border-2 border-rose-600 p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_#e11d48]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-900/60 text-rose-300 border border-rose-700">
                    POPULAR // LITIGANT PRO
                  </span>
                  <span className="font-mono text-[10px] text-rose-400 font-bold uppercase">FAST-TRACK</span>
                </div>
                <div>
                  <div className="text-3xl font-black font-mono text-white">₹499</div>
                  <p className="text-xs font-mono text-stone-400">Per matter / full dossier</p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  For freelancers, small landlords, and consumers requiring complete evidence hashing and lawyer-ready briefs.
                </p>
                <ul className="space-y-2 font-mono text-xs text-stone-300 pt-2 border-t border-stone-800">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Unlimited Contract Redlines</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Advocate Case Pack (Indexed PDF)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Speed Post Delivery Tracking Support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Priority Document AI Extraction</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider block text-center shadow-[2px_2px_0px_0px_#FFFFFF]"
                >
                  Get Started with Pro
                </Link>
              </div>
            </div>

            {/* Enterprise / Law Chambers */}
            <div className="bg-white border-2 border-stone-900 p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_#0A0A0A]">
              <div className="space-y-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 border border-stone-300">
                  LAW CHAMBERS &amp; ENTERPRISE
                </span>
                <div>
                  <div className="text-3xl font-black font-mono text-stone-900">₹2,999</div>
                  <p className="text-xs font-mono text-stone-500">Per month / unlimited seats</p>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Engineered for litigation teams, corporate legal counsels, and startups reviewing vendor agreements.
                </p>
                <ul className="space-y-2 font-mono text-xs text-stone-700 pt-2 border-t border-stone-200">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bulk Batch Document Parsing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-User Collaboration &amp; Dockets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom Jurisdictional Rules &amp; SLA</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Technical Account Manager</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/pilot"
                  className="w-full py-2.5 border-2 border-stone-900 hover:bg-stone-50 text-stone-900 font-mono text-xs font-bold uppercase tracking-wider block text-center"
                >
                  Contact Chamber Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="border-b-2 border-stone-900 pb-4 text-center space-y-1">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
            § 05 // FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-stone-900 tracking-tight">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {faqs.map((faq, fIdx) => (
            <div key={fIdx} className="bg-white border-2 border-stone-900">
              <button
                onClick={() => toggleFaq(fIdx)}
                className="w-full p-4 text-left font-bold uppercase text-stone-900 flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === fIdx ? (
                  <ChevronUp className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                )}
              </button>
              {openFaq === fIdx && (
                <div className="p-4 pt-0 border-t border-stone-100 text-stone-600 font-sans text-xs leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Bottom High-Converting Startup Banner */}
      <section className="bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 border-t-2 border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 bg-stone-950 border-2 border-stone-800 p-8 sm:p-12 shadow-[8px_8px_0px_0px_#e11d48]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-rose-950 border border-rose-800 font-mono text-[10px] text-rose-300 font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>STARTUP ACCELERATED JUSTICE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Ready to take control of your contract or dispute?
            </h2>
            <p className="font-mono text-xs text-stone-400 uppercase leading-relaxed">
              Upload your agreement, run semantic redlines, or draft an enforceable legal notice in under 4 minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/login"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center shadow-[4px_4px_0px_0px_#FFFFFF]"
            >
              Sign In / Instant Demo
            </Link>
            <Link
              href="/features"
              className="px-6 py-3.5 border-2 border-white hover:bg-white hover:text-stone-900 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              Explore All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#0A0A0A] border-t-2 border-stone-800 z-40 flex items-center justify-between gap-3 shadow-2xl font-mono">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
            NyaySaathi Legal AI
          </span>
          <span className="text-[10px] text-rose-500 uppercase">9 Modules Live</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/features"
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white font-mono font-bold text-xs uppercase tracking-wider"
          >
            FEATURES
          </Link>
          <Link
            href="/login"
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1"
          >
            <span>SIGN IN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
