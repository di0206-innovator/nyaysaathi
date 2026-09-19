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

export default function NewMatterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading Wizard...</div>}>
      <NewMatterContent />
    </Suspense>
  );
}

function NewMatterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
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

  const categories = [
    { id: 'tenancy_housing', label: 'Tenancy & Housing (Security Deposit, Rent, Eviction)', icon: <Home className="w-4 h-4" /> },
    { id: 'consumer_dispute', label: 'Consumer & Warranty Dispute (Defective Product, Service)', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'workplace_employment', label: 'Workplace & Salary (Withheld Wages, F&F, Gratuity)', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'financial_cheque_bounce', label: 'Financial & Cheque Bounce (Section 138 NI Act)', icon: <Coins className="w-4 h-4" /> },
    { id: 'property_rera', label: 'Real Estate & RERA (Delayed Possession, Builder Dispute)', icon: <Building2 className="w-4 h-4" /> },
    { id: 'cyber_fraud', label: 'Cyber Crime & Online Financial Fraud', icon: <Scale className="w-4 h-4" /> },
    { id: 'other', label: 'Other Grievance / Civil Dispute', icon: <FileText className="w-4 h-4" /> }
  ];

  const helpfulPromptChips = [
    'When did this issue first begin?',
    'What was promised in writing vs what happened?',
    'How much total money is owed or withheld?',
    'What did they say when you asked them to resolve it?'
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
    setIsProcessing(true);
    setProcessingStage(1);

    const stages = [
      'Normalizing narrative and parties with Intake Agent...',
      'Extracting document clauses and OCR text...',
      'Reconstructing chronological event milestones...',
      'Consulting Indian statutory frameworks (BNS, CPA 2019, RERA)...',
      'Calculating limitation time-bars and risk vectors...',
      'Formulating 3-phase action roadmap...',
      'Generating legal demand notices and 1-page lawyer brief...',
      'Auditing outputs with Trust & Safety 4-Tier Verification...'
    ];

    // Simulate animated pipeline stages
    for (let i = 1; i <= stages.length; i++) {
      setProcessingStage(i);
      await new Promise(r => setTimeout(r, 450));
    }

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
          documents
        })
      });

      const data = (await res.json()) as { success?: boolean; data?: { id?: string } };
      if (data.success && data.data?.id) {
        router.push(`/matters/${data.data.id}`);
      } else {
        alert('Failed to initialize matter. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    const stageNames = [
      'Intake & Party Identification',
      'Document Intelligence & OCR',
      'Chronology & Timeline Mapping',
      'Indian Statutory Retrieval',
      'Limitation & Risk Assessment',
      'Phased Action Planning',
      'Legal Notice & Advocate Brief Drafting',
      'Trust & Safety 4-Tier Audit'
    ];

    return (
      <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-850 p-8 rounded-2xl border border-stone-800 space-y-6 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Scale className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Analyzing Your Matter</h2>
            <p className="text-xs text-stone-400">
              Running 9 modular internal agents to organize your case dossier...
            </p>
          </div>

          <div className="space-y-2 text-left bg-stone-900/90 p-4 rounded-xl border border-stone-800 text-xs">
            {stageNames.map((name, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-2 transition-all ${
                  idx < processingStage
                    ? 'text-emerald-400 font-medium'
                    : idx === processingStage
                    ? 'text-amber-400 font-bold'
                    : 'text-stone-600'
                }`}
              >
                {idx < processingStage ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                    {idx + 1}
                  </div>
                )}
                <span className="text-[11px]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Step {step} of 4
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              {step === 1 && 'What type of legal situation is this?'}
              {step === 2 && 'What happened? Tell your story.'}
              {step === 3 && 'Who are the parties involved?'}
              {step === 4 && 'Add supporting documents or chats'}
            </h1>
          </div>
        </div>

        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <p className="text-xs text-stone-600">
              Select the broad category under Indian law that matches your situation:
            </p>

            <div className="space-y-2.5">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  onClick={() => setCategory(cat.id as MatterCategory)}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    category === cat.id
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id as MatterCategory)}
                    className="accent-amber-600"
                  />
                  <div className="text-stone-700">{cat.icon}</div>
                  <span className="text-xs font-bold text-stone-900">{cat.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>Continue to Narrative</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Narrative & What Happened */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Matter Title (Short headline)
              </label>
              <input
                type="text"
                placeholder="e.g. Withholding of ₹75,000 security deposit by landlord in Koramangala"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-800">
                  What Happened? (Explain in your own words)
                </label>
              </div>

              {/* Prompt chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase self-center mr-1">Include:</span>
                {helpfulPromptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPromptChip(chip)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 text-stone-700 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={7}
                required
                placeholder="Explain the background, dates of transaction, what was promised, how much is owed, and what the other party did..."
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                className="w-full text-xs p-3.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
              />
            </div>

            {/* Financial Stake & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Claim Stake / Amount (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Mumbai, Delhi"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  State
                </label>
                <select
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-100">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  if (!userStory.trim()) {
                    alert('Please provide a brief explanation of what happened.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>Continue to Parties</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Parties Involved */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <p className="text-xs text-stone-600">
              Provide names or details of yourself and the opposing party (landlord, merchant, company, or individual):
            </p>

            <div className="space-y-4">
              {/* Party 1: Aggrieved */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">1. Your Details (Aggrieved Party)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">You</span>
                </div>
                <input
                  type="text"
                  placeholder="Your Full Name (e.g. Arjun Verma)"
                  value={parties[0]?.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParties(prev => [{ ...prev[0], name: val }, prev[1]]);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>

              {/* Party 2: Opposing */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">2. Opposing Entity / Respondent</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">Opposing</span>
                </div>
                <input
                  type="text"
                  placeholder="Landlord / Company / Merchant Name (e.g. R. K. Sundaram)"
                  value={parties[1]?.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParties(prev => [prev[0], { ...prev[1], name: val }]);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-100">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>Continue to Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Evidence & Run Analysis */}
        {step === 4 && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <p className="text-xs text-stone-600">
              Add any supporting documents (agreements, receipts, invoices, or WhatsApp chat text). You can also proceed directly and add documents later.
            </p>

            {/* Document list */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800">Attached Supporting Items:</span>
                {documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                    <span className="font-medium text-stone-900">📄 {d.title}</span>
                    <button
                      onClick={() => setDocuments(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-stone-400 hover:text-rose-600 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Doc Form */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-amber-700" />
                <span>Attach New Evidence / Chat Transcript</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Registered Lease Agreement)"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                />

                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as DocumentEvidence['type'])}
                  className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="rental_agreement">Rental Agreement</option>
                  <option value="invoice_bill">Invoice / Purchase Receipt</option>
                  <option value="whatsapp_chat">WhatsApp / SMS Chat</option>
                  <option value="bank_statement">Bank / UPI Transfer Record</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <textarea
                rows={2}
                placeholder="Optional: Paste text excerpt or key clause..."
                value={newDocSnippet}
                onChange={(e) => setNewDocSnippet(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
              />

              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!newDocTitle}
                className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold disabled:opacity-50"
              >
                + Add to Locker
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-100">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleCreateMatter}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Run Matter Navigator & Analyze</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
