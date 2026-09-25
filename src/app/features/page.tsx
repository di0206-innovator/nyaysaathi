'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeftRight,
  MessageSquare,
  FolderLock,
  PlusCircle,
  FileCheck2,
  BarChart3,
  Users,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  Clock,
  Coins,
  Building2,
  Home,
  ShoppingBag,
  Briefcase,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

interface FeatureItem {
  id: string;
  category: 'document' | 'dispute' | 'analytics' | 'citizen';
  title: string;
  subtitle: string;
  description: string;
  href: string;
  ctaText: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  statutes: string[];
  keyCapabilities: string[];
  demoSnippet?: {
    label: string;
    value: string;
  };
}

const ALL_FEATURES: FeatureItem[] = [
  {
    id: 'understand',
    category: 'document',
    title: 'Document Understanding & Extraction',
    subtitle: 'GenAI Legal Contract Parser with Strict Provenance',
    description: 'Instantly ingest complex agreements and extract key parties, financial liabilities, lock-in clauses, termination penalties, and governing jurisdiction with verifiable line citations.',
    href: '/understand',
    ctaText: 'Launch Document Understanding',
    icon: <BookOpen className="w-5 h-5 text-rose-600" />,
    badge: 'GenAI Extraction',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-300',
    statutes: ['Indian Contract Act 1872', 'Information Technology Act 2000'],
    keyCapabilities: [
      'Automatic entity identification (Lessor, Lessee, Vendor, Client)',
      'Monetary terms & penalty clause isolation',
      'Plain-language summary of onerous or unilateral clauses',
      'Confidence scoring with exact source text quotes'
    ],
    demoSnippet: {
      label: 'Sample Extraction Result',
      value: 'Identified: 11-Month Lock-in Period • Arbitrary 2-month painting deduction clause flagged as HIGH RISK.'
    }
  },
  {
    id: 'compare',
    category: 'document',
    title: 'Semantic Clause Redline & Comparison',
    subtitle: 'Cross-Revision Semantic Diff & Risk Escalation Index',
    description: 'Compare two versions of an agreement (e.g., initial draft vs counterparty revision). Detect silent shifts in liability, indemnity traps, altered lock-in dates, and calculate an overall Risk Delta Score.',
    href: '/compare',
    ctaText: 'Launch Clause Comparator',
    icon: <ArrowLeftRight className="w-5 h-5 text-amber-600" />,
    badge: 'Semantic Redline',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-300',
    statutes: ['Specific Relief Act 1963', 'Commercial Courts Act 2015'],
    keyCapabilities: [
      'Visual redline with inline additions and deletions',
      'Clause-by-clause semantic alignment (not dumb text diffing)',
      'Risk Escalation Delta (0-100) scoring',
      'Exportable comparison report for negotiations'
    ],
    demoSnippet: {
      label: 'Risk Escalation Detected',
      value: 'Version 2 added unilateral 18% p.a. delayed interest and shifted jurisdiction from Bengaluru to Mumbai.'
    }
  },
  {
    id: 'ask',
    category: 'document',
    title: 'Document-Grounded Q&A Engine',
    subtitle: 'Zero-Hallucination Legal Querying with Citations',
    description: 'Ask any natural language question about your uploaded contracts. Every answer is strictly grounded in the document text, referencing exact clause numbers and sentence locations.',
    href: '/ask',
    ctaText: 'Ask Your Document',
    icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
    badge: 'Zero Hallucination',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    statutes: ['Bharatiya Sakshya Adhiniyam 2023', 'Indian Evidence Act'],
    keyCapabilities: [
      'Context-confined query execution to eliminate hallucinations',
      'Verifiable citation cards linking directly to source clauses',
      'Pre-configured benchmark question library',
      'Multi-query exploration with conversational memory'
    ],
    demoSnippet: {
      label: 'Verified Q&A Answer',
      value: '“What happens if the security deposit is not refunded within 14 days?” → Clause 8.2 prescribes 12% statutory interest.'
    }
  },
  {
    id: 'matters-hub',
    category: 'dispute',
    title: 'Dispute Matters Vault & Case Registry',
    subtitle: 'Structured Pre-Litigation Lifecycle Manager',
    description: 'Central command for all your active legal disputes. Track claim values, opposing parties, limitation countdowns, evidence checklists, and escalation statuses in one structured dashboard.',
    href: '/matters',
    ctaText: 'View Active Matters',
    icon: <FolderLock className="w-5 h-5 text-blue-600" />,
    badge: 'Case Management',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-300',
    statutes: ['Limitation Act 1963', 'Civil Procedure Code 1908'],
    keyCapabilities: [
      'Full lifecycle tracking: Evidence → Notice → Escalation',
      'Aggregate monetary claims and recovery status',
      'Time-bar limitation warnings with red alert flags',
      'Direct link to Advocate Case Pack downloads'
    ],
    demoSnippet: {
      label: 'Live Matters Telemetry',
      value: '₹14.8Cr+ total claims managed across 1,240+ cases with 82% pre-litigation resolution rate.'
    }
  },
  {
    id: 'intake-wizard',
    category: 'dispute',
    title: 'Intake Wizard & Notice Drafter',
    subtitle: 'Specialized Pre-Litigation Legal Notice Generator',
    description: 'Step-by-step guided interview that compiles dispute facts into enforceable legal demand notices tailored to Indian statutory frameworks across 6 major consumer and civil dispute classes.',
    href: '/matters/new',
    ctaText: 'Draft New Legal Notice',
    icon: <PlusCircle className="w-5 h-5 text-rose-600" />,
    badge: 'Automated Drafting',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-300',
    statutes: [
      'Sec 138 Negotiable Instruments Act',
      'Consumer Protection Act 2019',
      'Real Estate (RERA) Act 2016'
    ],
    keyCapabilities: [
      '6 domain-specific intake funnels (Rent, Consumer, Salary, Cheques, RERA, Breach)',
      'Statutory 15-day and 30-day notice period timers',
      'Pre-filled statutory citations and factual timelines',
      'Ready-to-print notice with registered AD mailing instructions'
    ],
    demoSnippet: {
      label: 'Notice Output Format',
      value: 'Generates formal Legal Notice with Speed Post/Registered AD address block and mandatory statutory demand language.'
    }
  },
  {
    id: 'case-pack',
    category: 'dispute',
    title: 'Advocate Case Pack & Pre-Litigation Dossier',
    subtitle: 'Court-Ready Evidentiary Bundles for Legal Counsels',
    description: 'Assemble all facts, contracts, proof of payments, correspondence, and limitation calculations into a comprehensive dossier prepared in compliance with the Advocates Act 1961.',
    href: '/matters',
    ctaText: 'Explore Dossiers in Matters',
    icon: <FileCheck2 className="w-5 h-5 text-indigo-600" />,
    badge: 'Court-Ready',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    statutes: ['Advocates Act 1961', 'Commercial Courts Act 2015'],
    keyCapabilities: [
      'Chronological sequence of dispute events with timestamp verification',
      'Calculated interest and damages breakdown under statutory rates',
      'One-click PDF Advocate Brief ready for trial counsel briefing',
      'DLSA (District Legal Services Authority) referral ready'
    ],
    demoSnippet: {
      label: 'Advocate Package Contents',
      value: 'Includes: Chronological Synopsis, Limitation Calculation, Demand Notice Proof, Statutory Citations & Prayer.'
    }
  },
  {
    id: 'analytics',
    category: 'analytics',
    title: 'Dispute Telemetry & Legal Analytics',
    subtitle: 'System-Wide Empirical Resolution & Recovery Metrics',
    description: 'Empirical transparency dashboard showcasing dispute resolution velocity, recovery success rates, category breakdowns, and average days to notice compliance across Indian states.',
    href: '/analytics',
    ctaText: 'View System Analytics',
    icon: <BarChart3 className="w-5 h-5 text-teal-600" />,
    badge: 'Telemetry & BI',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-300',
    statutes: ['Transparency & Public Legal Record Guidelines'],
    keyCapabilities: [
      'Geographical claim distribution heatmaps',
      'Mean days to settlement post-notice issuance',
      'Recovery percentage across tenancy vs consumer disputes',
      'System latency and AI extraction accuracy telemetry'
    ],
    demoSnippet: {
      label: 'Key Metric',
      value: 'Median resolution time: 18.4 days post-formal statutory notice delivery.'
    }
  },
  {
    id: 'pilot',
    category: 'citizen',
    title: 'Citizen Legal Aid Pilot Program',
    subtitle: 'Access-to-Justice Cohort for Free Pre-Litigation Help',
    description: 'Pro bono initiative delivering free document intelligence and dispute assistance to tenants, gig workers, and aggrieved consumers. Includes access code verification and expedited review.',
    href: '/pilot',
    ctaText: 'Join Pilot Cohort',
    icon: <Users className="w-5 h-5 text-purple-600" />,
    badge: 'Pro Bono Program',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-300',
    statutes: ['Legal Services Authorities Act 1987', 'Constitution of India Art 39A'],
    keyCapabilities: [
      'Zero cost access for eligible individual consumers & tenants',
      'Integration with NALSA 15100 free legal aid routing',
      'Empirical calibration to improve Indian legal NLP precision',
      'Priority onboarding with pilot invitation keys'
    ],
    demoSnippet: {
      label: 'Cohort Reach',
      value: 'Over 450+ citizens onboarded across Karnataka, Maharashtra, Delhi NCR, and Tamil Nadu.'
    }
  },
  {
    id: 'account-privacy',
    category: 'citizen',
    title: 'DPDP Privacy Center & Account Portal',
    subtitle: 'Complete Citizen Data Sovereignty & Portability',
    description: 'Engineered from the ground up for compliance with the Digital Personal Data Protection Act (DPDPA 2023). Complete ownership of your data with 1-click JSON export and permanent deletion.',
    href: '/account',
    ctaText: 'Access Privacy Portal',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    badge: 'DPDPA 2023',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    statutes: ['Digital Personal Data Protection Act 2023'],
    keyCapabilities: [
      'One-click full account and dossier JSON export',
      'Zero model retention on user private documents',
      'Permanent right-to-be-forgotten deletion workflows',
      'Audit log tracking for every data access event'
    ],
    demoSnippet: {
      label: 'Privacy Guarantee',
      value: 'Your contracts are processed in memory and never used to train third-party public models.'
    }
  }
];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'document' | 'dispute' | 'analytics' | 'citizen'>('all');

  // Interactive Statutory Limitation & Forum Fee Calculator State
  const [calcDisputeType, setCalcDisputeType] = useState('consumer');
  const [calcClaimAmount, setCalcClaimAmount] = useState('150000');
  const [calcDateOfBreach, setCalcDateOfBreach] = useState('2024-03-15');

  const filteredFeatures = activeCategory === 'all'
    ? ALL_FEATURES
    : ALL_FEATURES.filter((f) => f.category === activeCategory);

  // Limitation calculation logic
  const calculateLimitation = () => {
    const amount = Number(calcClaimAmount) || 0;
    let limitationPeriodYears = 3;
    let statute = 'Limitation Act 1963, Schedule Article 113 / 55';
    let forum = 'Civil Court / Summary Suit (Order 37 CPC)';
    let notes = 'Standard 3-year limitation from the date the breach or debt arose.';

    if (calcDisputeType === 'consumer') {
      limitationPeriodYears = 2;
      statute = 'Consumer Protection Act 2019, Section 69';
      notes = 'Strict 2-year limitation from the date on which cause of action arose.';
      if (amount <= 5000000) {
        forum = 'District Consumer Disputes Redressal Commission (DCDRC) via e-Daakhil';
      } else if (amount <= 20000000) {
        forum = 'State Consumer Disputes Redressal Commission (SCDRC)';
      } else {
        forum = 'National Consumer Disputes Redressal Commission (NCDRC)';
      }
    } else if (calcDisputeType === 'cheque') {
      limitationPeriodYears = 1 / 12; // 30 days
      statute = 'Negotiable Instruments Act 1881, Section 138 & 142';
      forum = 'Judicial Magistrate First Class / Metropolitan Magistrate Court';
      notes = 'Statutory Demand Notice must be served within 30 days of bank memo; formal complaint within 30 days after 15-day notice period.';
    } else if (calcDisputeType === 'rent') {
      limitationPeriodYears = 3;
      statute = 'Limitation Act 1963, Article 52 & State Rent Control Acts';
      forum = 'Rent Tribunal / Small Causes Court / DLSA Conciliation';
      notes = '3 years from the date rent or security deposit refund fell due.';
    } else if (calcDisputeType === 'rera') {
      limitationPeriodYears = 3;
      statute = 'Real Estate (Regulation and Development) Act 2016, Section 18';
      forum = 'State RERA Authority & Adjudicating Officer';
      notes = 'Refund with interest or monthly delay interest until physical possession is delivered.';
    }

    // Calculate deadline date
    const breachDate = new Date(calcDateOfBreach || '2024-01-01');
    const deadlineDate = new Date(breachDate);
    if (calcDisputeType === 'cheque') {
      deadlineDate.setDate(deadlineDate.getDate() + 30);
    } else {
      deadlineDate.setFullYear(deadlineDate.getFullYear() + limitationPeriodYears);
    }

    const today = new Date();
    const isBarred = deadlineDate < today;
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      limitationPeriod: calcDisputeType === 'cheque' ? '30 Days' : `${limitationPeriodYears} Years`,
      statute,
      forum,
      notes,
      deadlineString: deadlineDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      isBarred,
      daysRemaining: diffDays
    };
  };

  const limitResult = calculateLimitation();

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] font-sans selection:bg-rose-600 selection:text-white">
      {/* 1. Header Banner */}
      <section className="bg-[#0A0A0A] text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b-2 border-stone-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-3 text-xs font-mono">
            <div className="flex items-center space-x-2 text-rose-500 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-rose-600 inline-block" />
              <span>§ 01 // COMPLETE PRODUCT SUITE &amp; CAPABILITIES</span>
            </div>
            <span className="text-stone-400 font-mono text-[11px] uppercase">
              10 SPECIALIZED MODULES // VERIFIED GROUNDING
            </span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
              THE FULL LEGAL <br />
              <span className="text-rose-500">INTELLIGENCE SUITE</span>.
            </h1>
            <p className="text-sm sm:text-base font-mono text-stone-300 leading-relaxed uppercase max-w-3xl">
              Every tool engineered to resolve contractual ambiguity, redline revisions, eliminate hallucinations, and transform grievances into enforceable pre-litigation dossiers under Indian statutory jurisprudence.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-[4px_4px_0px_0px_#FFFFFF] flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/matters/new"
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Draft Legal Notice
            </Link>
            <Link
              href="/compare"
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Compare Agreement Revisions
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Category Tabs */}
      <section className="sticky top-16 z-40 bg-[#FBFBF9] border-b-2 border-stone-900 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-[2px_2px_0px_0px_#e11d48]'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              All Features (9)
            </button>
            <button
              onClick={() => setActiveCategory('document')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === 'document'
                  ? 'bg-stone-900 text-white shadow-[2px_2px_0px_0px_#e11d48]'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              Document AI &amp; Redlines
            </button>
            <button
              onClick={() => setActiveCategory('dispute')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === 'dispute'
                  ? 'bg-stone-900 text-white shadow-[2px_2px_0px_0px_#e11d48]'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              Dispute Dossiers &amp; Notices
            </button>
            <button
              onClick={() => setActiveCategory('analytics')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === 'analytics'
                  ? 'bg-stone-900 text-white shadow-[2px_2px_0px_0px_#e11d48]'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              Analytics &amp; BI
            </button>
            <button
              onClick={() => setActiveCategory('citizen')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === 'citizen'
                  ? 'bg-stone-900 text-white shadow-[2px_2px_0px_0px_#e11d48]'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              Citizen Aid &amp; DPDP
            </button>
          </div>

          <div className="text-[11px] font-mono text-stone-600 hidden md:block">
            Showing <strong className="text-stone-900">{filteredFeatures.length}</strong> modules
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat, idx) => (
            <div
              key={feat.id}
              className="bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_0px_#e11d48] transition-all flex flex-col justify-between p-6 group"
            >
              <div className="space-y-4">
                {/* Header line */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="w-10 h-10 bg-stone-100 border border-stone-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <div className="font-mono text-[10px] text-stone-700 uppercase tracking-widest">
                    MODULE 0{idx + 1}
                  </div>
                  <h3 className="text-lg font-black uppercase text-stone-900 tracking-tight group-hover:text-rose-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs font-mono text-stone-700 mt-0.5">
                    {feat.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {feat.description}
                </p>

                {/* Key Capabilities */}
                <div className="space-y-1.5 pt-2">
                  <div className="font-mono text-[10px] font-bold uppercase text-stone-700">
                    Core Capabilities:
                  </div>
                  <ul className="space-y-1">
                    {feat.keyCapabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="text-[11px] text-stone-700 flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo Snippet if available */}
                {feat.demoSnippet && (
                  <div className="p-3 bg-stone-50 border-l-2 border-stone-900 font-mono text-[11px] space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-stone-700 font-bold block">
                      {feat.demoSnippet.label}
                    </span>
                    <p className="text-stone-800 leading-snug">
                      {feat.demoSnippet.value}
                    </p>
                  </div>
                )}

                {/* Statutory Grounding Tags */}
                <div className="pt-2">
                  <div className="font-mono text-[10px] text-stone-700 uppercase tracking-wider mb-1">
                    Indian Legal Authority:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {feat.statutes.map((stat, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-stone-100 text-stone-700 font-mono text-[10px] border border-stone-300"
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-stone-200 mt-6">
                <Link
                  href={feat.href}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between group-hover:bg-rose-600"
                >
                  <span>{feat.ctaText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Built-in Interactive Tool: Statutory Limitation & Court Fee Calculator */}
      <section className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t-2 border-b-2 border-stone-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="border-b border-stone-800 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
                <Calculator className="w-4 h-4 text-rose-500" />
                <span>INTERACTIVE STARTUP UTILITY</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                Limitation Act &amp; Forum Jurisdiction Calculator
              </h2>
            </div>
            <span className="font-mono text-xs text-stone-400 bg-stone-800 px-3 py-1 border border-stone-700">
              BASED ON LIMITATION ACT 1963 &amp; CPA 2019
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-5 bg-stone-950 border border-stone-800 p-6 space-y-5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-stone-800 pb-2">
                01 // Dispute Parameters
              </h3>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-stone-300 uppercase">
                  Dispute Category
                </label>
                <select
                  value={calcDisputeType}
                  onChange={(e) => setCalcDisputeType(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-white p-2.5 text-xs font-mono focus:outline-none focus:border-rose-500"
                >
                  <option value="consumer">Consumer Deficiency (Defective Product / Denied Service)</option>
                  <option value="rent">Tenant Security Deposit / Unpaid Rent</option>
                  <option value="cheque">Cheque Dishonor (Sec 138 NI Act)</option>
                  <option value="rera">Builder Delay / RERA Possession Claim</option>
                  <option value="contract">Commercial Breach of Contract / Unpaid Invoices</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-stone-300 uppercase">
                  Claim Value (in ₹ INR)
                </label>
                <input
                  type="number"
                  value={calcClaimAmount}
                  onChange={(e) => setCalcClaimAmount(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-white p-2.5 text-xs font-mono focus:outline-none focus:border-rose-500"
                  placeholder="150000"
                />
                <span className="text-[10px] font-mono text-stone-400">
                  Formatted: {formatCurrencyINR(Number(calcClaimAmount) || 0)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-stone-300 uppercase">
                  Date When Cause of Action / Breach Arose
                </label>
                <input
                  type="date"
                  value={calcDateOfBreach}
                  onChange={(e) => setCalcDateOfBreach(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-white p-2.5 text-xs font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2">
                <Link
                  href={`/matters/new?category=${calcDisputeType === 'consumer' ? 'consumer_dispute' : calcDisputeType === 'rent' ? 'tenancy_housing' : calcDisputeType === 'cheque' ? 'financial_cheque_bounce' : 'workplace_employment'}&claimAmount=${calcClaimAmount}`}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-[3px_3px_0px_0px_#FFFFFF]"
                >
                  <span>Launch Notice Drafter with this Claim</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="lg:col-span-7 bg-stone-950 border border-stone-800 p-6 space-y-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-stone-800 pb-2">
                02 // Statutory Assessment Output
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800">
                  <div className="font-mono text-[10px] text-stone-400 uppercase">
                    Statutory Limitation Window
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {limitResult.limitationPeriod}
                  </div>
                  <div className="text-[11px] font-mono text-rose-400 mt-1">
                    {limitResult.statute}
                  </div>
                </div>

                <div className={`p-4 border ${limitResult.isBarred ? 'bg-rose-950/60 border-rose-600' : 'bg-stone-900 border-stone-800'}`}>
                  <div className="font-mono text-[10px] text-stone-400 uppercase">
                    Estimated Limitation Deadline
                  </div>
                  <div className={`text-2xl font-black font-mono mt-1 ${limitResult.isBarred ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {limitResult.deadlineString}
                  </div>
                  <div className="text-[11px] font-mono text-stone-300 mt-1">
                    {limitResult.isBarred ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        TIME-BARRED (Barred by Limitation)
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        {limitResult.daysRemaining} days remaining to file
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Forum Routing */}
              <div className="p-4 bg-stone-900 border border-stone-800 space-y-2 font-mono">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Designated Judicial / Redressal Forum:
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-500" />
                  <span>{limitResult.forum}</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed font-sans pt-1">
                  {limitResult.notes}
                </p>
              </div>

              <div className="p-3 bg-stone-900/60 border border-stone-800 font-mono text-[11px] text-stone-400 flex items-center justify-between">
                <span>Direct e-Daakhil filing supported for consumer disputes.</span>
                <a
                  href="https://edaakhil.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Conversion Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0A0A0A] text-white border-2 border-stone-900 p-8 sm:p-12 shadow-[8px_8px_0px_0px_#e11d48] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs text-rose-500 uppercase font-bold tracking-widest">
              DEPLOY NYAYSAATHI FOR YOUR CONTRACT OR DISPUTE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Ready to resolve your dispute with verified AI clarity?
            </h2>
            <p className="font-mono text-xs text-stone-400 uppercase leading-relaxed">
              Upload your agreement or draft an enforceable legal demand notice in under 4 minutes. 100% free for individual citizens.
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
              href="/matters/new"
              className="px-6 py-3.5 border-2 border-white hover:bg-white hover:text-stone-900 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              Start Matter Intake
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
