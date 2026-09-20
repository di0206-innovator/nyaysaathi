'use client';

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, HelpCircle, ThumbsDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface PilotFeedbackWidgetProps {
  matterId: string;
  category?: string;
  onSuccess?: () => void;
}

export function PilotFeedbackWidget({ matterId, category = 'general', onSuccess }: PilotFeedbackWidgetProps) {
  const [utility, setUtility] = useState<'yes' | 'partially' | 'no' | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [correctionCategory, setCorrectionCategory] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [correctionText, setCorrectionText] = useState<string>('');
  const [advocateConsulted, setAdvocateConsulted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matterId,
          rating,
          category,
          feedbackText: feedbackText || `User evaluated utility as ${utility}.`,
          correctionCategory: correctionCategory || undefined,
          correctionText: correctionText || undefined,
          advocateConsulted,
          source: 'matter_dossier'
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setError(json.error || 'Failed to record feedback.');
      }
    } catch {
      setError('Network error submitting feedback.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-3 text-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="font-bold">Evaluation Recorded</p>
          <p className="text-emerald-700">Thank you. Your feedback helps calibrate NyaySaathi legal precision.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
      <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
        <MessageSquare className="w-4 h-4 text-amber-600" />
        <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
          Pilot Evaluation &amp; Legal Grounding Feedback
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-medium text-stone-700 mb-1.5">
            Was this dossier and action plan useful for your situation?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setUtility('yes'); setRating(5); }}
              className={`py-2 px-3 rounded-lg border text-center font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                utility === 'yes'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-stone-50 border-stone-250 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Yes</span>
            </button>

            <button
              type="button"
              onClick={() => { setUtility('partially'); setRating(3); }}
              className={`py-2 px-3 rounded-lg border text-center font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                utility === 'partially'
                  ? 'bg-amber-50 border-amber-500 text-amber-800'
                  : 'bg-stone-50 border-stone-250 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Partially</span>
            </button>

            <button
              type="button"
              onClick={() => { setUtility('no'); setRating(1); }}
              className={`py-2 px-3 rounded-lg border text-center font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                utility === 'no'
                  ? 'bg-rose-50 border-rose-500 text-rose-800'
                  : 'bg-stone-50 border-stone-250 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
              <span>No</span>
            </button>
          </div>
        </div>

        {utility && utility !== 'yes' && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                What was wrong or missing?
              </label>
              <select
                value={correctionCategory}
                onChange={(e) => setCorrectionCategory(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">-- Select issue category --</option>
                <option value="incorrect_fact">Incorrect fact or interpretation</option>
                <option value="incorrect_legal_explanation">Incorrect or stale legal statute cited</option>
                <option value="missing_evidence">Missing evidence or unparsed document details</option>
                <option value="wrong_action">Recommended action is impractical or wrong</option>
                <option value="wrong_deadline">Statutory deadline or limitation error</option>
                <option value="wrong_escalation">Improper forum or escalation route</option>
                <option value="unclear_draft">Notice draft is unclear or aggressive</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Specific correction details:
              </label>
              <textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                rows={2}
                placeholder="E.g., In Bengaluru, my agreement explicitly says painting is ₹10,000 max..."
                className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-medium text-stone-700 mb-1">
            General comments or feedback:
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={2}
            placeholder="Share thoughts on usefulness, draft clarity, or suggestions..."
            className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="advocateConsulted"
            checked={advocateConsulted}
            onChange={(e) => setAdvocateConsulted(e.target.checked)}
            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="advocateConsulted" className="text-stone-600 text-[11px] cursor-pointer">
            An advocate or lawyer reviewed this dossier with me
          </label>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !utility}
          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Pilot Evaluation'}
        </button>
      </form>
    </div>
  );
}
