'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MatterCategory, Party, DocumentEvidence } from '@/types/matter';
import { INDIAN_STATES } from '@/lib/legal/indian-jurisdictions';
import {
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Home,
  ShoppingBag,
  Briefcase,
  Coins,
  Building2,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function NewMatterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-stone-500">INITIALIZING FILING WIZARD...</div>}>
      <NewMatterContent />
    </Suspense>
  );
}

function NewMatterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const initialCat = (searchParams.get('category') as MatterCategory) || 'tenancy_housing';

  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<MatterCategory>(initialCat);
  const [title, setTitle] = useState('');
  const [userStory, setUserStory] = useState('');
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('Karnataka');

  // Parties
  const [parties, setParties] = useState<Array<{ name: string; role: Party['role']; contactInfo?: string }>>([
    { name: '', role: 'Aggrieved (You)' },
    { name: '', role: 'Opposing Party' }
  ]);

  // Documents
  const [documents, setDocuments] = useState<Array<{ title: string; type: DocumentEvidence['type']; extractedText?: string }>>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentEvidence['type']>('rental_agreement');
  const [newDocSnippet, setNewDocSnippet] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);

  // Anti-spam & Validation
  const [honeypot, setHoneypot] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    { id: 'tenancy_housing', label: 'Tenancy & Housing (Security Deposit, Rent, Eviction)', icon: <Home className="w-4 h-4 text-rose-600" /> },
    { id: 'consumer_dispute', label: 'Consumer & Warranty Dispute (Defective Goods, Service)', icon: <ShoppingBag className="w-4 h-4 text-stone-900" /> },
    { id: 'workplace_employment', label: 'Workplace & Salary (Withheld Wages, F&F Settlement)', icon: <Briefcase className="w-4 h-4 text-stone-900" /> },
    { id: 'financial_cheque_bounce', label: 'Financial & Cheque Dishonor (Sec 138 NI Act)', icon: <Coins className="w-4 h-4 text-stone-900" /> },
    { id: 'property_rera', label: 'Real Estate & RERA (Delayed Possession, Builder Defect)', icon: <Building2 className="w-4 h-4 text-stone-900" /> },
    { id: 'cyber_fraud', label: 'Cyber Crime & Online Financial Fraud', icon: <Scale className="w-4 h-4 text-stone-900" /> },
    { id: 'other', label: 'Other Grievance / Civil Dispute', icon: <FileText className="w-4 h-4 text-stone-900" /> }
  ];

  const helpfulPromptChips = [
    'When did this issue first begin?',
    'What was agreed in writing vs actual occurrence?',
    'Total monetary stake withheld or claimed?',
    'What was the adverse party’s response to demands?'
  ];

  const handleAddPromptChip = (chip: string) => {
    setUserStory((prev) => (prev ? `${prev}\n\n[Regarding ${chip}]: ` : `[Regarding ${chip}]: `));
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;
    setDocuments(prev => [...prev, { title: newDocTitle, type: newDocType, extractedText: newDocSnippet }]);
    setNewDocTitle('');
    setNewDocSnippet('');
  };

  const handleCreateMatter = async () => {
    // Anti-spam honeypot defense
    if (honeypot) {
      console.warn('Spam submission dropped by honeypot.');
      router.push('/matters');
      return;
    }

    setIsProcessing(true);
    setProcessingStage(1);

    const acquisitionSource =
      searchParams.get('source') ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('nyaysaathi_acquisition_source') : null) ||
      'direct';

    try {
      const res = await apiFetch('/api/matters', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: title || `${category.replace(/_/g, ' ').toUpperCase()} Matter`,
          category,
          userStory,
          claimAmount: claimAmount ? parseFloat(claimAmount) : undefined,
          locationCity,
          locationState,
          parties: parties.filter(p => p.name.trim() !== ''),
          documents,
          acquisitionSource
        })
      });

      const data = (await res.json()) as { success?: boolean; data?: { id?: string } };
      if (data.success && data.data?.id) {
        router.push(`/matters/${data.data.id}`);
      } else {
        showToast('error', 'Matter Initialization Failed', 'Could not create matter. Please verify your connection and try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    const stageNames = [
      '01 // Intake & Party Identification',
      '02 // Document Intelligence & OCR Verification',
      '03 // Chronology & Fact Mapping',
      '04 // Indian Statutory Code Retrieval',
      '05 // Limitation Period & Risk Assessment',
      '06 // Phased Action Planning',
      '07 // Legal Notice & Advocate Brief Synthesis',
      '08 // Trust & Safety 4-Tier Audit'
    ];

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full bg-[#121212] p-8 border-2 border-stone-800 space-y-6 text-center">
          <div className="w-12 h-12 bg-rose-600 text-white flex items-center justify-center mx-auto border border-black font-black">
            <Scale className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              Compiling Legal Dossier
            </h2>
            <p className="text-xs text-stone-400 uppercase">
              Executing multi-agent DAG pipeline under Indian Statutory Frameworks...
            </p>
          </div>

          <div className="space-y-2 text-left bg-black p-4 border border-stone-800 text-xs">
            {stageNames.map((name, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-2 transition-all ${
                  idx < processingStage
                    ? 'text-emerald-400 font-bold'
                    : idx === processingStage
                    ? 'text-rose-400 font-black'
                    : 'text-stone-700'
                }`}
              >
                {idx < processingStage ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 border border-current flex items-center justify-center text-[8px] shrink-0 font-bold">
                    {idx + 1}
                  </div>
                )}
                <span className="text-[11px] truncate uppercase">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-10 px-4 sm:px-6 lg:px-8 font-sans text-[#0A0A0A]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Wizard Progress Masthead */}
        <div className="border-b-2 border-[#0A0A0A] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-200">
              § STEP 0{step} OF 04 // FILING DOCKET
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A] mt-2">
              {step === 1 && 'Select Legal Category'}
              {step === 2 && 'Dispute Narrative & Financial Claim'}
              {step === 3 && 'Party Identification & Roles'}
              {step === 4 && 'Evidentiary Attachments & Launch'}
            </h1>
          </div>
          <div className="font-mono text-xs text-stone-500 uppercase">
            REPUBLIC OF INDIA
          </div>
        </div>

        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="bg-white p-6 border-2 border-[#0A0A0A] space-y-4">
            <p className="text-xs text-stone-600 font-mono uppercase tracking-wider">
              SELECT GOVERNING DISPUTE CLASSIFICATION:
            </p>

            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <label
                  key={cat.id}
                  onClick={() => setCategory(cat.id as MatterCategory)}
                  className={`flex items-center space-x-3 p-3.5 border cursor-pointer transition-all ${
                    category === cat.id
                      ? 'border-2 border-rose-600 bg-rose-50/40'
                      : 'border-stone-300 hover:border-[#0A0A0A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id as MatterCategory)}
                    className="accent-rose-600"
                  />
                  <div className="font-mono text-xs font-bold text-stone-400">0{idx + 1}.</div>
                  <div>{cat.icon}</div>
                  <span className="text-xs font-bold uppercase text-[#0A0A0A]">{cat.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-black transition-colors"
              >
                <span>Proceed to Narrative</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Narrative & What Happened */}
        {step === 2 && (
          <div className="bg-white p-6 border-2 border-[#0A0A0A] space-y-5">
            <div>
              <label className="block font-mono text-xs font-bold text-[#0A0A0A] uppercase tracking-wider mb-1">
                Matter Title (Formal Case Header)
              </label>
              <input
                type="text"
                placeholder="e.g. Unlawful withholding of security deposit for lease at Koramangala"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-black font-mono uppercase bg-[#FBFBF9]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-xs font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Factual Chronology &amp; Incident Narrative
                </label>
              </div>

              {/* Prompt chips */}
              <div className="flex flex-wrap gap-1.5 mb-2 font-mono text-[11px]">
                <span className="text-stone-500 font-bold uppercase self-center mr-1">Include:</span>
                {helpfulPromptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPromptChip(chip)}
                    className="px-2 py-0.5 border border-stone-300 hover:border-black hover:bg-stone-100 text-stone-700 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              {/* Hidden Anti-Spam Honeypot Field */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="company_site_hp">Leave this empty</label>
                <input
                  id="company_site_hp"
                  type="text"
                  name="company_site_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <textarea
                rows={7}
                required
                aria-invalid={!!formErrors.userStory}
                aria-describedby={formErrors.userStory ? 'userStory-error' : undefined}
                placeholder="Detail the background, dates of transaction, written terms, total sum withheld, and adverse party's responses..."
                value={userStory}
                onChange={(e) => {
                  setUserStory(e.target.value);
                  if (formErrors.userStory) {
                    setFormErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.userStory;
                      return copy;
                    });
                  }
                }}
                className={`w-full text-xs p-3.5 border leading-relaxed font-sans focus:outline-none focus:ring-2 ${
                  formErrors.userStory
                    ? 'border-rose-600 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-stone-300 focus:ring-black bg-[#FBFBF9]'
                }`}
              />
              {formErrors.userStory && (
                <p id="userStory-error" role="alert" className="mt-1 font-mono text-xs text-rose-600 font-bold uppercase">
                  [ERROR: {formErrors.userStory}]
                </p>
              )}
            </div>

            {/* Financial Stake & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div>
                <label className="block font-bold text-[#0A0A0A] uppercase mb-1">
                  Dispute Stake (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-black bg-[#FBFBF9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A0A0A] uppercase mb-1">
                  City of Jurisdiction
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Mumbai, Delhi"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-black bg-[#FBFBF9] uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A0A0A] uppercase mb-1">
                  State
                </label>
                <select
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-black bg-[#FBFBF9] font-mono uppercase"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-200 font-mono">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-stone-300 text-xs font-bold uppercase text-stone-700 hover:border-black flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  if (!userStory.trim() || userStory.trim().length < 15) {
                    setFormErrors({ userStory: 'Provide at least 15 characters explaining what happened.' });
                    showToast('warning', 'Narrative Required', 'Please provide a brief explanation of what happened (at least 15 characters).');
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border border-black"
              >
                <span>Continue to Parties</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Parties Involved */}
        {step === 3 && (
          <div className="bg-white p-6 border-2 border-[#0A0A0A] space-y-5">
            <p className="font-mono text-xs text-stone-600 uppercase tracking-wider">
              PARTY IDENTIFICATION (CLAIMANT &amp; RESPONDENT):
            </p>

            <div className="space-y-4 font-mono text-xs">
              {/* Party 1: Aggrieved */}
              <div className="p-4 border border-stone-300 space-y-2 bg-[#FBFBF9]">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <span className="font-bold text-[#0A0A0A] uppercase">01 // Aggrieved Party (You)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-900 text-white uppercase">[CLAIMANT]</span>
                </div>
                <input
                  type="text"
                  placeholder="Your Full Legal Name (e.g. Arjun Verma)"
                  value={parties[0]?.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParties(prev => [{ ...prev[0], name: val }, prev[1]]);
                  }}
                  className="w-full text-xs px-3 py-2 border border-stone-300 bg-white uppercase"
                />
              </div>

              {/* Party 2: Opposing */}
              <div className="p-4 border border-stone-300 space-y-2 bg-[#FBFBF9]">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <span className="font-bold text-[#0A0A0A] uppercase">02 // Opposing Entity / Respondent</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-600 text-white uppercase">[RESPONDENT]</span>
                </div>
                <input
                  type="text"
                  placeholder="Landlord / Company / Merchant Legal Name"
                  value={parties[1]?.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParties(prev => [prev[0], { ...prev[1], name: val }]);
                  }}
                  className="w-full text-xs px-3 py-2 border border-stone-300 bg-white uppercase"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-200 font-mono">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-stone-300 text-xs font-bold uppercase text-stone-700 hover:border-black flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border border-black"
              >
                <span>Continue to Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Evidence & Run Analysis */}
        {step === 4 && (
          <div className="bg-white p-6 border-2 border-[#0A0A0A] space-y-6">
            <p className="font-mono text-xs text-stone-600 uppercase tracking-wider">
              ATTACH VERIFIABLE EVIDENCE (AGREEMENTS, RECEIPTS, TRANSCRIPTS):
            </p>

            {/* Document list */}
            {documents.length > 0 && (
              <div className="space-y-2 font-mono">
                <span className="text-xs font-bold uppercase text-stone-800">ATTACHED EVIDENTIARY EXHIBITS:</span>
                {documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 border border-stone-300 bg-[#FBFBF9] text-xs">
                    <span className="font-bold text-[#0A0A0A] uppercase">[EXHIBIT 0{i + 1}]: {d.title}</span>
                    <button
                      onClick={() => setDocuments(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold uppercase"
                    >
                      [Remove]
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Doc Form */}
            <div className="p-4 border border-stone-300 bg-[#FBFBF9] space-y-3 font-mono text-xs">
              <h4 className="font-bold text-[#0A0A0A] uppercase flex items-center space-x-2">
                <Upload className="w-4 h-4 text-rose-600" />
                <span>Add Evidence Item / Transaction Excerpt</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="EXHIBIT TITLE (E.G. REGISTERED LEASE AGREEMENT)"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="text-xs px-3 py-2 border border-stone-300 bg-white uppercase"
                />

                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as DocumentEvidence['type'])}
                  className="text-xs px-3 py-2 border border-stone-300 bg-white font-mono uppercase"
                >
                  <option value="rental_agreement">Rental / Lease Agreement</option>
                  <option value="invoice_bill">Invoice / Payment Receipt</option>
                  <option value="whatsapp_chat">Communication Transcript</option>
                  <option value="bank_statement">Bank / UPI Transfer Record</option>
                  <option value="other">Other Written Evidence</option>
                </select>
              </div>

              <textarea
                rows={2}
                placeholder="Optional: Paste text clause, transaction reference number, or excerpt..."
                value={newDocSnippet}
                onChange={(e) => setNewDocSnippet(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 bg-white font-sans"
              />

              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!newDocTitle}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                + Lock into Dossier
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-200 font-mono">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-stone-300 text-xs font-bold uppercase text-stone-700 hover:border-black flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleCreateMatter}
                className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-black active:translate-y-px"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Compile Dossier &amp; Run Analysis</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
