import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  FolderLock,
  PhoneCall,
  Building2,
  ShoppingBag,
  Briefcase,
  Coins,
  Home,
  FileText
} from 'lucide-react';
import { SEED_MATTERS } from '@/lib/db/seed-data';
import { formatCurrencyINR } from '@/lib/utils';

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
      {/* 1. Swiss Poster Hero Section */}
      <section className="bg-[#0A0A0A] text-white border-b-2 border-stone-800 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Monospace Metadata */}
          <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4 text-xs font-mono">
            <div className="flex items-center space-x-2 text-stone-400">
              <span className="w-2 h-2 bg-rose-600 inline-block" />
              <span className="text-white font-bold tracking-widest uppercase">
                § 00 // SYSTEM DIRECTIVE
              </span>
              <span className="text-stone-400">• MATTER-BASED LEGAL ACTION ARCHITECTURE</span>
            </div>
            <div className="text-rose-400 tracking-wider uppercase font-bold text-[11px] pt-1 sm:pt-0">
              [NOT A CHATBOT // ADMISSIBLE EVIDENCE GROUNDED]
            </div>
          </div>

          {/* Bold Display Headline (International Typographic Style) */}
          <div className="space-y-4 max-w-5xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
              CLEAR CONFUSION.<br />
              <span className="text-rose-500">ORGANIZE EVIDENCE.</span><br />
              EXECUTE ACTION.
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-2xl font-mono leading-relaxed uppercase">
              Transform unstructured disputes into disciplined pre-litigation matters under Indian law. Verifiable timelines, limitation time-bars, statutory legal notices, and advocate case dossiers.
            </p>
          </div>

          {/* Action Triggers */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/matters/new"
              className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 border border-black active:translate-y-px"
            >
              <span>Start New Matter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/matters"
              className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-stone-200 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 border border-stone-700"
            >
              <FolderLock className="w-4 h-4 text-stone-400" />
              <span>Explore Existing Matters</span>
            </Link>

            <Link
              href="/pilot"
              className="px-6 py-4 bg-transparent hover:bg-stone-900 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 border border-rose-900/60"
            >
              <span>Pilot Intake</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Technical Metadata Bar */}
          <div className="border-t border-stone-800 pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-stone-400">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>NALSA LEGAL AID HELPLINE: <strong className="text-white">15100</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>LIMITATION ACT 1963 TIME-BAR ENGINE</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>STATUTORY COMPLIANCE: ADVOCATES ACT 1961</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The 5-Stage Modular Grid */}
      <section className="border-b-2 border-[#0A0A0A] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border-b-2 border-[#0A0A0A] pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
                § 01 // ARCHITECTURAL LOOP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">
                The 5-Stage Legal Action Pipeline
              </h2>
            </div>
            <span className="font-mono text-xs text-stone-500 uppercase">
              STRUCTURED DOSSIER // NOT TRANSIENT CHAT
            </span>
          </div>

          {/* 5-Column Grid with Hairline Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-5 border border-[#0A0A0A]">
            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-[#FBFBF9]">
              <div className="font-mono text-xs font-black text-rose-600">01.</div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">CAPTURE</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Narrative intake, lease agreements, UPI transaction receipts, and chat exports.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: INGESTION
              </div>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-[#FBFBF9]">
              <div className="font-mono text-xs font-black text-stone-900">02.</div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">MAP</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Truthful OCR extracts clauses, creates chronological timelines, and locks contract terms.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: PROVENANCE
              </div>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-[#FBFBF9]">
              <div className="font-mono text-xs font-black text-stone-900">03.</div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">ASSESS</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Calculates limitation periods, identifies evidentiary gaps, and flags counter-claim risks.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: LIMITATION
              </div>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-[#0A0A0A] space-y-3 bg-[#FBFBF9]">
              <div className="font-mono text-xs font-black text-stone-900">04.</div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">ACT</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Generates formal Indian legal notices, consumer complaints, and Speed Post demand letters.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: DISPATCH
              </div>
            </div>

            <div className="p-5 space-y-3 bg-[#FBFBF9]">
              <div className="font-mono text-xs font-black text-rose-600">05.</div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">ESCALATE</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Assembles a 10-section Advocate Case Pack for DLSA, Lok Adalat, or enrolled legal counsel.
              </p>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pt-2 border-t border-stone-200">
                STAGE: ADVOCACY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Primary Wedge: Urban Tenancy Security Deposit Recovery */}
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
                Generates a formal 15-day legal demand letter and an indexed 10-section Advocate Case Pack for dispute resolution.
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

      {/* 4. Judicial Docket: Live Interactive Matters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-b-2 border-[#0A0A0A] pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
              § 02 // DOCKET SAMPLES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Pre-Analyzed Dispute Dossiers
            </h2>
            <p className="text-xs text-stone-600 font-mono mt-1 uppercase">
              Click any matter to inspect the complete multi-agent pipeline, chronology, and advocate brief.
            </p>
          </div>

          <Link
            href="/matters"
            className="inline-flex items-center space-x-1 font-mono text-xs font-bold uppercase text-rose-600 hover:text-rose-700 tracking-wider"
          >
            <span>VIEW COMPLETE WORKSPACE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
                § 03 // DISPUTE TAXONOMY
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
              § 04 // TRUST &amp; RESPONSIBILITY ARCHITECTURE
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

      {/* Sticky Mobile Action Bar - Swiss Design Edition */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#0A0A0A] border-t-2 border-stone-800 z-40 flex items-center justify-between gap-3 shadow-2xl font-mono">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
            DISPUTE DOSSIER INTAKE
          </span>
          <span className="text-[10px] text-rose-500 uppercase">§ BNS / LIMITATION 1963</span>
        </div>
        <Link
          href="/matters/new"
          className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <span>START</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
