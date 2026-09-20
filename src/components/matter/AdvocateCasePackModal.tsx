'use client';

import React, { useState, useEffect } from 'react';
import { AdvocateCasePack } from '@/lib/repository/matter-service';
import { apiFetch } from '@/lib/api/client';
import {
  Briefcase,
  Printer,
  X,
  AlertTriangle
} from 'lucide-react';

interface AdvocateCasePackModalProps {
  matterId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdvocateCasePackModal({
  matterId,
  isOpen,
  onClose
}: AdvocateCasePackModalProps) {
  const [pack, setPack] = useState<AdvocateCasePack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    async function loadCasePack() {
      setLoading(true);
      setError(null);
      const { data, error: err, ok } = await apiFetch<AdvocateCasePack>(`/api/matters/${matterId}/advocate-pack`);
      if (!ignore) {
        if (!ok || err || !data) {
          setError(err || 'Failed to generate Advocate Case Pack');
        } else {
          setPack(data);
        }
        setLoading(false);
      }
    }
    loadCasePack();

    return () => {
      ignore = true;
    };
  }, [matterId, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-pack-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <div>
              <h2 id="case-pack-title" className="text-sm font-bold tracking-wide">Advocate Case Preparation Pack</h2>
              <p className="text-[11px] text-stone-400">Standardized 10-section brief for legal-aid and advocate consultations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              disabled={!pack || loading}
              aria-label="Print or save as PDF"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close advocate case pack"
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto space-y-8 print:p-0 print:space-y-6 text-stone-900 bg-stone-50/30">
          {loading && (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-stone-600">Assembling Case Pack from evidence, chronology & actions...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {pack && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-xs border border-stone-200 print:border-none print:shadow-none space-y-8">
              {/* Document Header */}
              <div className="border-b-2 border-stone-900 pb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Advocate Case Pack • Informational Brief
                    </span>
                    <h1 className="text-2xl font-black text-stone-900 mt-2">{pack.title}</h1>
                    <p className="text-xs text-stone-500 mt-1">
                      Category: <span className="font-semibold text-stone-800">{pack.category}</span> • Jurisdiction: <span className="font-semibold text-stone-800">{pack.jurisdiction}</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-stone-500">
                    <p>Generated: {pack.generatedAt.split('T')[0]}</p>
                    <p className="font-mono text-stone-400">Matter #{pack.matterId.slice(0, 14)}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-stone-100 rounded-lg text-[11px] text-stone-600 border border-stone-200">
                  <span className="font-bold text-stone-800">DISCLAIMER: </span>
                  {pack.disclaimer}
                </div>
              </div>

              {/* 1. Executive Summary */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  1. Executive Summary & Dispute Core
                </h3>
                <p className="text-xs text-stone-800 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                  {pack.executiveSummary}
                </p>
              </section>

              {/* 2. Parties */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  2. Involved Parties
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {pack.parties.map(p => (
                    <div key={p.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                      <p className="font-bold text-stone-900">{p.name}</p>
                      <p className="text-[11px] text-stone-500 capitalize">{p.role.replace(/_/g, ' ')}</p>
                      {p.contactInfo && <p className="text-[10px] text-stone-400 mt-1">{p.contactInfo}</p>}
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Chronology */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  3. Key Chronology of Events
                </h3>
                <div className="divide-y divide-stone-100 text-xs">
                  {pack.chronology.map((c, idx) => (
                    <div key={idx} className="py-2 flex items-start justify-between">
                      <div>
                        <span className="font-mono text-stone-500 font-bold">{c.date}: </span>
                        <span className="font-semibold text-stone-900">{c.title}</span>
                        <p className="text-[11px] text-stone-600 mt-0.5">{c.description}</p>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0 ml-2">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. Evidence Index */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  4. Evidence Locker Index
                </h3>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {pack.evidenceIndex.map(e => (
                    <div key={e.id} className="p-2 bg-stone-50 rounded border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{e.title}</span>
                        <span className="text-[11px] text-stone-500 ml-2">({e.classification})</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {e.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Legal Issues & Statutes */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  5. Identified Statutory Provisions
                </h3>
                <div className="space-y-2 text-xs">
                  {pack.legalIssues.map((s, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <p className="font-bold text-stone-900">{s.statute}, {s.section}</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">{s.title}: {s.applicability}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. Risks & Limitation */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  6. Legal Risks & Procedural Limitations
                </h3>
                <div className="space-y-1.5 text-xs">
                  {pack.risksAndUncertainties.map((r, idx) => (
                    <div key={idx} className="p-2 rounded bg-amber-50/50 border border-amber-200">
                      <span className="font-bold text-amber-950">{r.title} ({r.severity.toUpperCase()}): </span>
                      <span className="text-stone-700">{r.description}</span>
                      {r.limitationInfo && <p className="text-[10px] text-stone-500 mt-0.5">Limitation: {r.limitationInfo}</p>}
                    </div>
                  ))}
                </div>
              </section>

              {/* 7. Actions Taken */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  7. Actions Executed by Client
                </h3>
                {pack.actionsTaken.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No formal actions completed yet.</p>
                ) : (
                  <div className="space-y-1 text-xs">
                    {pack.actionsTaken.map((a, idx) => (
                      <div key={idx} className="p-2 bg-emerald-50/40 rounded border border-emerald-200 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-stone-900">✓ {a.title}</span>
                          {a.proof && <span className="text-[10px] text-emerald-800 ml-2 font-mono">[{a.proof}]</span>}
                        </div>
                        <span className="text-[10px] text-stone-400">{a.completedAt.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 8. Outstanding Actions */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  8. Outstanding Recommended Actions
                </h3>
                <div className="space-y-1 text-xs">
                  {pack.outstandingActions.map((a, idx) => (
                    <div key={idx} className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between items-center">
                      <span className="font-semibold text-stone-800">○ {a.title}</span>
                      <span className="text-[10px] uppercase font-bold text-stone-500">{a.phase.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 9. Drafts */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  9. Prepared Draft Notices & Demands
                </h3>
                <div className="space-y-1 text-xs">
                  {pack.drafts.map(d => (
                    <div key={d.id} className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{d.title}</span>
                        <span className="text-[11px] text-stone-500 ml-2">To: {d.recipient}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 10. Escalation History */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  10. Escalation Pathways & Authority Submissions
                </h3>
                <div className="space-y-1.5 text-xs">
                  {pack.escalationHistory.map((e, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-stone-900">{e.authority}</p>
                        <p className="text-[11px] text-stone-500">Next Step: {e.nextStep || 'Verify requirements'}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
