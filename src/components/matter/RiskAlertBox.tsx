'use client';

import React, { useState } from 'react';
import { RiskItem, MissingInformation } from '@/types/matter';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Send
} from 'lucide-react';

interface RiskAlertBoxProps {
  risks: RiskItem[];
  missingInformation: MissingInformation[];
  onAnswerSubmit?: (id: string, answer: string) => Promise<void>;
}

export function RiskAlertBox({ risks, missingInformation, onAnswerSubmit }: RiskAlertBoxProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleAnswerChange = (id: string, text: string) => {
    setAnswers(prev => ({ ...prev, [id]: text }));
  };

  const submitAnswer = async (id: string) => {
    const text = answers[id];
    if (!text || !onAnswerSubmit) return;
    setSubmittingId(id);
    try {
      await onAnswerSubmit(id, text);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Risk Vectors */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Things to Pay Attention To (Risks & Limitation Rules)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Procedural vulnerabilities, statutory deadlines, and anticipated counter-arguments.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
            {risks.length} Risk Vectors
          </span>
        </div>

        <div className="space-y-4">
          {risks.map((risk) => {
            let borderClass = 'border-amber-200 bg-amber-50/50';
            let badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
            let icon = <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />;

            if (risk.severity === 'high' || risk.severity === 'critical') {
              borderClass = 'border-rose-200 bg-rose-50/40';
              badgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
              icon = <AlertTriangle className="w-4 h-4 text-rose-700 mt-0.5 shrink-0" />;
            }

            return (
              <div key={risk.id} className={`rounded-lg p-4 border ${borderClass} space-y-2`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-2">
                    {icon}
                    <h4 className="text-sm font-bold text-stone-900">{risk.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border self-start sm:self-auto ${badgeClass}`}>
                    Severity: {risk.severity}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {risk.description}
                </p>

                {/* Limitation Timer Badge */}
                {risk.limitationPeriodInfo && (
                  <div className="flex items-center space-x-2 text-xs text-stone-800 bg-white/90 p-2 rounded border border-stone-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>
                      Statutory Limitation: <strong>{risk.limitationPeriodInfo.statute}</strong> ({risk.limitationPeriodInfo.deadlineMonths} Months total window).
                      {risk.limitationPeriodInfo.daysRemaining && (
                        <span className="ml-1 text-emerald-700 font-semibold">
                          ~{risk.limitationPeriodInfo.daysRemaining} days remaining.
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Mitigating Action */}
                <div className="text-xs bg-stone-100/90 p-2.5 rounded border border-stone-200 text-stone-800">
                  <span className="font-semibold text-stone-900">Recommended Safeguard: </span>
                  {risk.mitigatingAction}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Missing Information Questionnaire */}
      {missingInformation.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Information That Can Make Your Case Stronger</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Answering these questions clarifies factual points before drafting or escalating.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {missingInformation.map((info) => (
              <div key={info.id} className="p-4 rounded-lg bg-blue-50/40 border border-blue-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-900">{info.question}</p>
                    <p className="text-[11px] text-stone-600">
                      <strong>Why it matters:</strong> {info.whyItMatters}
                    </p>
                    <p className="text-[11px] text-blue-700">
                      <strong>Suggested Source:</strong> {info.suggestedSource}
                    </p>
                  </div>
                  {info.isAnswered && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Answered</span>
                    </span>
                  )}
                </div>

                {info.isAnswered ? (
                  <div className="text-xs bg-white p-2.5 rounded border border-stone-200 text-stone-800">
                    <span className="font-semibold text-stone-900">Recorded Answer: </span>
                    {info.answer}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type your answer or confirm details here..."
                      value={answers[info.id] || ''}
                      onChange={(e) => handleAnswerChange(info.id, e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => submitAnswer(info.id)}
                      disabled={!answers[info.id] || submittingId === info.id}
                      className="px-3 py-2 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center space-x-1 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submittingId === info.id ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
