import React from 'react';
import Link from 'next/link';
import {
  Scale,
  ArrowRight,
  ShieldCheck,
  FolderLock,
  PhoneCall,
  Building2,
  ShoppingBag,
  Briefcase,
  Coins,
  Home
} from 'lucide-react';
import { SEED_MATTERS } from '@/lib/db/seed-data';
import { formatCurrencyINR } from '@/lib/utils';

export default function HomePage() {
  const sampleCategories = [
    {
      id: 'tenancy_housing',
      title: 'Tenant Security Deposit',
      desc: 'Withholding of deposit, arbitrary painting deductions, eviction threats.',
      icon: <Home className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200'
    },
    {
      id: 'consumer_dispute',
      title: 'Consumer & Warranty Disputes',
      desc: 'Defective products, service deficiency, denied warranty repair, e-Daakhil filing.',
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'workplace_employment',
      title: 'Unpaid Wages & Settlement',
      desc: 'Withheld salary, full & final delays, unpaid gratuity, PF issues.',
      icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      id: 'financial_cheque_bounce',
      title: 'Cheque Bounce (Sec 138)',
      desc: 'Dishonored cheques, 15-day statutory demand notice, recovery roadmap.',
      icon: <Coins className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'property_rera',
      title: 'RERA Flat Possession Delay',
      desc: 'Delayed handover by builder, monthly delay interest claims, Form M petitions.',
      icon: <Building2 className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 selection:bg-amber-200">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-850 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Not a generic AI chatbot. A matter-based Legal Action Navigator.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Clear your confusion.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Organize your matter. Know your options.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-stone-300 max-w-3xl mx-auto leading-relaxed">
            Explain what happened, add your supporting documents, and receive a structured chronological dossier: verified facts, risk vectors, limitation countdowns, ready-to-send legal notices, and free legal aid pathways.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/matters/new"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm sm:text-base shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Start New Matter</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </Link>

            <Link
              href="/matters"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm sm:text-base border border-stone-700 transition-all flex items-center justify-center space-x-2"
            >
              <FolderLock className="w-4 h-4 text-amber-400" />
              <span>Explore Existing Matters</span>
            </Link>
          </div>

          {/* Quick Helpline Pill */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400">
            <span className="flex items-center space-x-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>National Legal Aid Helpline: <strong>15100</strong></span>
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>e-Daakhil Online Consumer Filing</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. The 5-Stage Action Loop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2">
              The NyaySaathi Loop
            </h2>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
              Engineered around Matters, not transient chat messages
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-stone-900">CAPTURE</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Explain what happened, upload lease agreements, invoices, or paste WhatsApp chat exports.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-stone-900">UNDERSTAND</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                OCR extracts evidence, organizes a chronological timeline, and verifies contractual facts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-stone-900">ASSESS</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Calculates statutory limitation periods, spots missing proof, and highlights risk vectors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                4
              </div>
              <h4 className="text-xs font-bold text-stone-900">ACT</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Generates formal Indian legal notices, consumer court complaints, and 3-phase action roadmaps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                5
              </div>
              <h4 className="text-xs font-bold text-stone-900">ESCALATE</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Prepares a 1-page Advocate Brief for DLSA Legal Aid, Lok Adalat, or private advocates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Primary Launch Wedge: Tenant-Landlord Security Deposit Dispute Navigator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Primary Launch Wedge • Urban India</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Withheld Security Deposit? Arbitrary Deductions?<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Execute a Grounded Recovery Roadmap.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              In Bengaluru, Delhi-NCR, Mumbai, and Hyderabad, tenant security deposits are frequently withheld under unsubstantiated painting deductions or delayed beyond agreed timelines. Legal remedies depend on your jurisdiction, agreement terms, move-out condition, and documented proof. NyaySaathi structures your tenancy evidence into an actionable legal recovery dossier.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-stone-850/80 border border-stone-700/80 space-y-1">
                <span className="text-xs font-bold text-amber-400">1. Evidence Lock</span>
                <p className="text-[11px] text-stone-300">Rental agreement terms, UPI deposit slips, and dated handover proofs.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-850/80 border border-stone-700/80 space-y-1">
                <span className="text-xs font-bold text-amber-400">2. Jurisdiction Grounding</span>
                <p className="text-[11px] text-stone-300">State Rent Acts, Leave &amp; License clauses, Model Tenancy Act (where adopted), &amp; Indian Contract Act §73 wear-and-tear standards.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-850/80 border border-stone-700/80 space-y-1">
                <span className="text-xs font-bold text-amber-400">3. Phased Notice Suite</span>
                <p className="text-[11px] text-stone-300">Amicable itemized dispute letter, Speed Post legal notice, and advocate brief.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/matters/new?category=tenancy_housing"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <span>Start Tenancy Deposit Matter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/analytics"
                className="px-5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-750 text-stone-300 font-semibold text-xs sm:text-sm border border-stone-700 transition-all flex items-center space-x-2"
              >
                <span>View Live Pilot Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pre-loaded Sample Matters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Live Interactive Test Fixtures
            </h2>
            <h3 className="text-2xl font-bold text-stone-900 mt-1">
              Explore Pre-Analyzed Indian Legal Scenarios
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Click any matter to inspect the complete 9-agent pipeline output, timeline, drafts, and 1-page lawyer brief.
            </p>
          </div>

          <Link
            href="/matters"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            <span>View All Matters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SEED_MATTERS.map((matter) => (
            <Link
              key={matter.id}
              href={`/matters/${matter.id}`}
              className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-500 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                    {matter.category.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {matter.claimAmount && (
                    <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      Stake: {formatCurrencyINR(matter.claimAmount)}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  {matter.title}
                </h4>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {matter.summary.plainLanguage}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                  <span>📍 {matter.locationCity}, {matter.locationState}</span>
                  <span>📄 {matter.documents.length} Evidence Docs</span>
                  <span>⚡ {matter.actionPlan.length} Phased Steps</span>
                  <span>⚖️ Legal Notice Ready</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
                <span>Inspect Matter Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Matter Types Grid */}
      <section className="bg-stone-100/70 border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-stone-900">What type of situation are you facing?</h3>
            <p className="text-xs text-stone-600">
              Select a category to start your guided matter capture intake.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/matters/new?category=${cat.id}`}
                className="bg-white rounded-xl p-5 border border-stone-200 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-stone-100 group-hover:bg-amber-100 transition-colors">
                      {cat.icon}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {cat.title}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-stone-500 group-hover:text-amber-700">
                  <span>Start Matter</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trust & Safety Principle Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>India-First Responsible AI System</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Why NyaySaathi is different from standard AI chat
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Standard AI chatbots guess, hallucinate certainty, and lose context in endless text threads. NyaySaathi persists a structured matter dossier, verifies dates against Indian statutory rules, separates verified facts from legal possibilities, and drafts actionable documents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700/80 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                1. Fact
              </span>
              <h4 className="text-xs font-bold text-white">Verified Ground Truth</h4>
              <p className="text-[11px] text-stone-400">
                Grounded solely in your uploaded agreements, bank receipts, and corroborated statements.
              </p>
            </div>

            <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700/80 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                2. Explanation
              </span>
              <h4 className="text-xs font-bold text-white">Plain Legal Meaning</h4>
              <p className="text-[11px] text-stone-400">
                Explains Indian statutes (BNS, CPA 2019, RERA, Rent Control) without intimidating jargon.
              </p>
            </div>

            <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700/80 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                3. Possibility
              </span>
              <h4 className="text-xs font-bold text-white">Potential Counter-Claims</h4>
              <p className="text-[11px] text-stone-400">
                Anticipates what the opposing party may argue so you are never caught unprepared.
              </p>
            </div>

            <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700/80 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                4. Counsel Required
              </span>
              <h4 className="text-xs font-bold text-white">Advocate Referral</h4>
              <p className="text-[11px] text-stone-400">
                Clearly demarcates court filings, cross-examinations, and affidavits requiring an enrolled advocate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Action Bar (Responsive Mobile Breakpoint) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 z-40 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-stone-100 truncate">Deposit Withheld or Dispute?</span>
          <span className="text-[10px] text-amber-400">Verified Legal Action Dossier</span>
        </div>
        <Link
          href="/matters/new"
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 active:scale-95"
        >
          <span>Start Matter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
