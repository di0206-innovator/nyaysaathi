import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  PhoneCall,
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
  Layers,
  AlertTriangle,
  CheckCircle2,
  FileDiff,
  Scale
} from 'lucide-react';
import { SEED_MATTERS } from '@/lib/db/seed-data';
import { formatCurrencyINR } from '@/lib/utils';
import { DEMO_DOCUMENT_SETS } from '@/lib/demo/demo-documents';

export default function HomePage() {
  const sampleCategories = [
    {
      id: 'tenancy_housing',
      num: '01',
      title: 'Tenant Security Deposit Recovery',
      desc: 'Withholding of deposit, arbitrary painting deductions, eviction threats under state rent acts.',
      icon: <Home className="w-4 h-4 text-rose-600" />
    },
    {
      id: 'consumer_dispute',
      num: '02',
      title: 'Consumer & Warranty Deficiency',
      desc: 'Defective products, service deficiency, denied warranty repair, e-Daakhil filing roadmap.',
      icon: <ShoppingBag className="w-4 h-4 text-stone-900" />
    },
    {
      id: 'workplace_employment',
      num: '03',
      title: 'Unpaid Wages & Settlement',
      desc: 'Withheld salary, full & final settlement delays, unpaid gratuity, PF compliance.',
      icon: <Briefcase className="w-4 h-4 text-stone-900" />
    },
    {
      id: 'financial_cheque_bounce',
      num: '04',
      title: 'Cheque Dishonor (Sec 138 NI Act)',
      desc: 'Dishonored cheques, mandatory 15-day statutory demand notice, recovery roadmap.',
      icon: <Coins className="w-4 h-4 text-stone-900" />
    },
    {
      id: 'property_rera',
      num: '05',
      title: 'Real Estate & RERA Possession',
      desc: 'Delayed handover by builder, monthly delay interest claims under Section 18 of RERA.',
      icon: <Building2 className="w-4 h-4 text-stone-900" />
    },
    {
      id: 'other',
      num: '06',
      title: 'General Civil Grievance',
      desc: 'Contract breach, unfulfilled service agreements, formal notice preparation.',
      icon: <FileText className="w-4 h-4 text-stone-900" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] selection:bg-rose-600 selection:text-white font-sans">
      {/* 1. Hero Section — GenAI Legal Document Understanding & Comparison */}
      <section className="bg-[#0A0A0A] text-white border-b-2 border-stone-800 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Monospace Metadata */}
          <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4 text-xs font-mono">
            <div className="flex items-center space-x-2 text-stone-400">
              <span className="w-2 h-2 bg-rose-600 inline-block" />
              <span className="text-white font-bold tracking-widest uppercase">
                § 00 // GENAI LEGAL DOCUMENT INTELLIGENCE
              </span>
              <span className="text-stone-400 hidden sm:inline">• UNDERSTAND • COMPARE • ASK • RESOLVE</span>
            </div>
            <div className="text-rose-400 tracking-wider uppercase font-bold text-[11px] pt-1 sm:pt-0">
              [INDIAN LEGAL SYSTEM GROUNDED // STRICT PROVENANCE]
            </div>
          </div>

          {/* Bold Display Headline (International Typographic Style) */}
          <div className="space-y-4 max-w-5xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
              UNDERSTAND CONTRACTS.<br />
              <span className="text-rose-500">COMPARE REVISIONS.</span><br />
              RESOLVE DISPUTES.
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-3xl font-mono leading-relaxed uppercase">
              The AI legal intelligence platform for India. Extract clauses with verified provenance, run semantic diffs with risk-escalation scoring across agreement versions, ask document-grounded questions without hallucinations, and navigate pre-litigation disputes into actionable dossiers.
            </p>
          </div>

          {/* Core Feature Triggers */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/understand"
              className="p-4 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-rose-500 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <BookOpen className="w-5 h-5 text-rose-500" />
                  <span className="font-mono text-[10px] text-stone-400 uppercase">01 // EXTRACT</span>
                </div>
                <h2 className="font-bold text-sm text-white uppercase group-hover:text-rose-400 transition-colors">
                  Understand Document
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Extract key parties, dates, monetary terms, jurisdiction, and clause breakdown with provenance.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-stone-800 flex items-center justify-between font-mono text-[11px] text-rose-400 font-bold uppercase">
                <span>Analyze Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/compare"
              className="p-4 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800 hover:border-rose-500 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <ArrowLeftRight className="w-5 h-5 text-rose-400" />
                  <span className="font-mono text-[10px] text-rose-300 uppercase">02 // COMPARE</span>
                </div>
                <h2 className="font-bold text-sm text-white uppercase group-hover:text-rose-300 transition-colors">
                  Compare Revisions
                </h2>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Side-by-side semantic clause diffs, risk change classification, and critical alterations detection.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-rose-900/60 flex items-center justify-between font-mono text-[11px] text-rose-300 font-bold uppercase">
                <span>Compare Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/ask"
              className="p-4 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-rose-500 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <span className="font-mono text-[10px] text-stone-400 uppercase">03 // ASK</span>
                </div>
                <h2 className="font-bold text-sm text-white uppercase group-hover:text-sky-300 transition-colors">
                  Ask Document AI
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Query legal documents directly. Get truthful answers grounded strictly in cited clauses.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-stone-800 flex items-center justify-between font-mono text-[11px] text-sky-400 font-bold uppercase">
                <span>Ask Questions</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/matters/new"
              className="p-4 bg-rose-600 hover:bg-rose-500 border border-rose-600 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Scale className="w-5 h-5 text-white" />
                  <span className="font-mono text-[10px] text-rose-200 uppercase">04 // RESOLVE</span>
                </div>
                <h2 className="font-bold text-sm text-white uppercase">
                  Start New Matter
                </h2>
                <p className="text-xs text-rose-100 leading-relaxed">
                  Transform dispute facts into formal Indian legal notices, limitation calculations, and advocate packs.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-rose-700 flex items-center justify-between font-mono text-[11px] text-white font-bold uppercase">
                <span>Start Dispute Matter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Technical Metadata Bar */}
          <div className="border-t border-stone-800 pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-stone-400">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>SEMANTIC CLAUSE ALIGNMENT &amp; RISK-DELTA ENGINE</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIMITATION ACT 1963 &amp; STATUTORY TIME-BAR</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
              <span>NALSA LEGAL AID: <strong className="text-white">15100</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Document Comparison Teaser Section */}
      <section className="border-b-2 border-[#0A0A0A] bg-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="border-b-2 border-[#0A0A0A] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
                § 01 // LIVE COMPARISON ENGINE
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
                Semantic Clause Redline &amp; Risk Delta
              </h2>
              <p className="text-xs text-stone-600 font-mono mt-1 uppercase">
                Instantly detect hidden clause shifts, unilateral penalty escalation, and jurisdiction changes across contract revisions.
              </p>
            </div>

            <Link
              href="/compare"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Open Comparison Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Comparison Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demo 1: Rental Agreement Comparison */}
            <div className="border-2 border-[#0A0A0A] bg-[#FBFBF9] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2">
                  <FileDiff className="w-4 h-4 text-rose-600" />
                  <span className="font-mono text-xs font-bold uppercase text-stone-900">
                    {DEMO_DOCUMENT_SETS[0]?.label || 'Rental Agreement'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase border border-rose-200">
                  Risk Escalated (+40 pts)
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                {DEMO_DOCUMENT_SETS[0]?.description}
              </p>

              {/* Sample Clause Diff View */}
              <div className="space-y-3 pt-2">
                <div className="border border-stone-300 bg-white p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-stone-500">
                    <span>CLAUSE: SECURITY DEPOSIT REFUND</span>
                    <span className="text-rose-600 font-bold">MODIFIED (HIGH RISK)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-stone-50 border border-stone-200 text-stone-700">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1">Original (v1)</span>
                      &quot;Security deposit of ₹1,00,000 shall be refunded within 7 days of handover...&quot;
                    </div>
                    <div className="p-2 bg-rose-50 border border-rose-200 text-rose-900">
                      <span className="text-[9px] uppercase font-bold text-rose-600 block mb-1">Modified (v2)</span>
                      &quot;Security deposit of ₹1,00,000 shall be refunded within 60 days... subject to mandatory 20% painting deduction.&quot;
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between font-mono text-xs">
                <span className="text-stone-500">6 CLAUSES COMPARED • 4 MODIFIED • 1 ADDED</span>
                <Link
                  href="/compare"
                  className="font-bold text-rose-600 hover:text-rose-700 uppercase flex items-center space-x-1"
                >
                  <span>Load in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Demo 2: Employment Contract Comparison */}
            <div className="border-2 border-[#0A0A0A] bg-[#FBFBF9] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2">
                  <FileDiff className="w-4 h-4 text-rose-600" />
                  <span className="font-mono text-xs font-bold uppercase text-stone-900">
                    {DEMO_DOCUMENT_SETS[1]?.label || 'Employment Contract'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase border border-amber-200">
                  Risk Escalated (+35 pts)
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                {DEMO_DOCUMENT_SETS[1]?.description}
              </p>

              {/* Sample Clause Diff View */}
              <div className="space-y-3 pt-2">
                <div className="border border-stone-300 bg-white p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-stone-500">
                    <span>CLAUSE: NON-COMPETE &amp; RESTRICTIVE COVENANTS</span>
                    <span className="text-amber-600 font-bold">MODIFIED (MODERATE RISK)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-stone-50 border border-stone-200 text-stone-700">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1">Original (Offer)</span>
                      &quot;Employee agrees not to solicit existing company clients for 6 months...&quot;
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900">
                      <span className="text-[9px] uppercase font-bold text-amber-600 block mb-1">Modified (Master)</span>
                      &quot;Employee agrees not to work for any direct competitor anywhere in India for 18 months...&quot;
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between font-mono text-xs">
                <span className="text-stone-500">6 CLAUSES COMPARED • 4 MODIFIED • 1 ADDED</span>
                <Link
                  href="/compare"
                  className="font-bold text-rose-600 hover:text-rose-700 uppercase flex items-center space-x-1"
                >
                  <span>Load in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4-Pillar GenAI Legal Intelligence Pipeline */}
      <section className="border-b-2 border-[#0A0A0A] bg-stone-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="border-b-2 border-[#0A0A0A] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
                § 02 // TECHNICAL ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">
                The NyaySaathi Document Intelligence Pipeline
              </h2>
            </div>
            <span className="font-mono text-xs text-stone-500 uppercase">
              STRUCTURED EXTRACTION // CLAUSE LEVEL MAPPING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 border border-[#0A0A0A]">
            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-rose-600">01.</span>
                <Layers className="w-4 h-4 text-stone-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">SEGMENTATION</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Parses raw legal text into discrete numbered clauses categorized by legal role (Rent, Indemnity, Liability, Termination, Jurisdiction, Confidentiality).
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: CLAUSE EXTRACTION
              </div>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-rose-600">02.</span>
                <ArrowLeftRight className="w-4 h-4 text-stone-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">SEMANTIC ALIGNMENT</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Matches clauses across revisions using title/category heuristics and semantic similarity to detect added, removed, identical, or altered terms.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: REVISION PAIRING
              </div>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-rose-600">03.</span>
                <AlertTriangle className="w-4 h-4 text-stone-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">RISK-DELTA SCORING</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Analyzes obligation asymmetry, penal interest jumps, notice window compression, and jurisdiction shifts to quantify user risk change.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: RISK CALCULATION
              </div>
            </div>

            <div className="p-5 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-rose-600">04.</span>
                <CheckCircle2 className="w-4 h-4 text-stone-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">GROUNDED Q&amp;A</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Answers user questions strictly with cited clauses, extracted terms, and explicit confidence provenance—never hallucinating facts.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: VERIFIED PROVENANCE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Wedge: Urban Tenancy Security Deposit Recovery */}
      <section className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8">
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

          {/* 3-Column Architectural Framework */}
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
                Generates a formal legal demand letter (specifying contractual/recommended cure period) and an indexed 10-section Advocate Case Pack for dispute resolution.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/matters/new?category=tenancy_housing"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
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

      {/* 4. Pre-Litigation Dispute Dossiers & Matter Engine */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-b-2 border-[#0A0A0A] pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
              § 03 // DISPUTE DOSSIERS &amp; ACTION ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
              From Document Intelligence to Legal Action
            </h2>
            <p className="text-xs text-stone-600 font-mono mt-1 uppercase">
              Once documents are analyzed, NyaySaathi builds statutory limitation timelines, formal legal notices, and advocate case packs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/matters/new"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Start New Matter
            </Link>
            <Link
              href="/matters"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              All Matters
            </Link>
          </div>
        </div>

        {/* Docket Rows with Visible Swiss Borders */}
        <div className="border border-[#0A0A0A] divide-y divide-[#0A0A0A] bg-white">
          {SEED_MATTERS.map((matter, idx) => (
            <Link
              key={matter.id}
              href={`/matters/${matter.id}`}
              className="p-6 hover:bg-stone-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-rose-600">DOCKET #{idx + 1}</span>
                  <span className="text-stone-300">/</span>
                  <span className="px-2 py-0.5 bg-stone-100 border border-stone-300 text-stone-800 font-bold uppercase text-[10px]">
                    {matter.category.replace(/_/g, ' ')}
                  </span>
                  {matter.claimAmount && (
                    <span className="font-bold text-stone-900 bg-amber-50 px-2 py-0.5 border border-amber-200">
                      STAKE: {formatCurrencyINR(matter.claimAmount)}
                    </span>
                  )}
                  <span className="text-stone-500 uppercase">
                    LOC: {matter.locationCity}, {matter.locationState}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-950 group-hover:text-rose-600 transition-colors">
                  {matter.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans">
                  {matter.summary.plainLanguage}
                </p>

                <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-stone-500 pt-1">
                  <span>DOCS: {matter.documents.length}</span>
                  <span>•</span>
                  <span>ACTIONS: {matter.actionPlan.length} STEPS</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">STATUS: NOTICE PREPARED</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-2 font-mono text-xs font-bold uppercase text-rose-600 group-hover:translate-x-1 transition-transform">
                <span>INSPECT DOSSIER</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Situation Classification Grid */}
      <section className="bg-stone-100 border-t-2 border-b-2 border-[#0A0A0A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-stone-300 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
                § 04 // DISPUTE TAXONOMY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">
                Select Dispute Category to Initialize Matter
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/matters/new?category=${cat.id}`}
                className="bg-white p-5 border border-[#0A0A0A] hover:border-rose-600 hover:shadow-md transition-all flex flex-col justify-between group"
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
        </div>
      </section>

      {/* 6. Trust & Safety 4-Tier Framework */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0A0A0A] text-white p-8 sm:p-12 border-2 border-stone-800 space-y-8">
          <div className="border-b border-stone-800 pb-4 max-w-3xl space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-500">
              § 05 // TRUST &amp; RESPONSIBILITY ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Why NyaySaathi is Not a Generic AI Chatbot
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              Generic LLMs guess certainty, fabricate case law citations, and lose context in endless threads. NyaySaathi enforces an evidence-grounded 4-tier semantic confidence model:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-stone-800">
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-stone-800 space-y-2 bg-stone-950">
              <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                [01 // VERIFIED FACT]
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Evidentiary Grounding</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Anchored strictly in uploaded agreements, bank receipts, and corroborated party facts.
              </p>
            </div>

            <div className="p-5 border-b sm:border-b-0 sm:border-r border-stone-800 space-y-2 bg-stone-950">
              <span className="font-mono text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                [02 // LEGAL MEANING]
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Plain Statutory Meaning</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Explains operative sections of BNS, Consumer Protection Act 2019, RERA, and Rent Acts.
              </p>
            </div>

            <div className="p-5 border-b sm:border-b-0 sm:border-r border-stone-800 space-y-2 bg-stone-950">
              <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                [03 // COUNTER-CLAIM]
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Adverse Possibility</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Anticipates defense arguments, counter-deductions, and procedural exceptions.
              </p>
            </div>

            <div className="p-5 space-y-2 bg-stone-950">
              <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                [04 // ADVOCATE BOUNDARY]
              </span>
              <h4 className="font-bold text-sm text-white uppercase">Counsel Mandate</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Demarcates court representation and filings requiring an enrolled Advocate under the Advocates Act 1961.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#0A0A0A] border-t-2 border-stone-800 z-40 flex items-center justify-between gap-3 shadow-2xl font-mono">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
            LEGAL DOC INTELLIGENCE
          </span>
          <span className="text-[10px] text-rose-500 uppercase">COMPARE • UNDERSTAND • ACT</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/compare"
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white font-mono font-bold text-xs uppercase tracking-wider"
          >
            COMPARE
          </Link>
          <Link
            href="/understand"
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1"
          >
            <span>START</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
