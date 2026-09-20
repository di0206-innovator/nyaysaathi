'use client';

import React, { useState } from 'react';
import { MatterResolutionRecord, ResolutionType } from '@/types/matter';
import { apiFetch } from '@/lib/api/client';
import {
  CheckCircle,
  X,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface ResolutionModalProps {
  matterId: string;
  isOpen: boolean;
  onClose: () => void;
  onResolutionSaved: (resolution: MatterResolutionRecord, isReopened?: boolean) => void;
  existingResolution?: MatterResolutionRecord;
}

export function ResolutionModal({
  matterId,
  isOpen,
  onClose,
  onResolutionSaved,
  existingResolution
}: ResolutionModalProps) {
  const isResolved = Boolean(existingResolution && !existingResolution.isReopened);
  const [resolutionType, setResolutionType] = useState<ResolutionType>(
    existingResolution?.resolutionType || 'full_settlement'
  );
  const [outcome, setOutcome] = useState(existingResolution?.outcome || '');
  const [amountRecovered, setAmountRecovered] = useState<number | ''>(
    existingResolution?.amountRecovered ?? ''
  );
  const [amountDisputed, setAmountDisputed] = useState<number | ''>(
    existingResolution?.amountDisputed ?? ''
  );
  const [notes, setNotes] = useState(existingResolution?.notes || '');
  const [reopenReason, setReopenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error, ok } = await apiFetch(`/api/matters/${matterId}/resolution`, {
        method: 'POST',
        body: JSON.stringify({
          resolutionType,
          outcome,
          amountRecovered: amountRecovered !== '' ? Number(amountRecovered) : undefined,
          amountDisputed: amountDisputed !== '' ? Number(amountDisputed) : undefined,
          notes
        })
      });

      if (!ok || error || !data) {
        throw new Error(error || 'Failed to record resolution');
      }

      onResolutionSaved((data as { resolution: MatterResolutionRecord }).resolution, false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error resolving matter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error, ok } = await apiFetch(`/api/matters/${matterId}/resolution`, {
        method: 'DELETE',
        body: JSON.stringify({
          reason: reopenReason || 'Reopened for follow-up enforcement'
        })
      });

      if (!ok || error || !data) {
        throw new Error(error || 'Failed to reopen matter');
      }

      onResolutionSaved((data as { resolution: MatterResolutionRecord }).resolution, true);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error reopening matter');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolution-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isResolved ? (
              <RotateCcw className="w-5 h-5 text-amber-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            )}
            <h3 id="resolution-modal-title" className="text-sm font-bold text-stone-900">
              {isResolved ? 'Reopen Resolved Matter' : 'Formally Resolve Matter'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close resolution modal"
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isResolved ? (
          <form onSubmit={handleReopen} className="p-6 space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
              <p className="font-bold">Matter Currently Marked as Resolved</p>
              <p>Resolution: {existingResolution?.outcome} ({existingResolution?.resolutionType.replace(/_/g, ' ')})</p>
              <p>Amount Recovered: ₹{existingResolution?.amountRecovered || 0}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Reason for Reopening Matter
              </label>
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
                placeholder="e.g. Counterparty dishonoured settlement cheque or failed to vacate within promised window..."
                className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                {submitting ? 'Reopening...' : 'Reopen Matter'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResolve} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Resolution Mechanism / Type
              </label>
              <select
                value={resolutionType}
                onChange={e => setResolutionType(e.target.value as ResolutionType)}
                className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
              >
                <option value="full_settlement">Full Mutual Settlement / Refund</option>
                <option value="partial_settlement">Partial Settlement Agreed</option>
                <option value="mediation_agreement">DLSA / Lok Adalat Mediated Accord</option>
                <option value="court_order">Formal Commission / Court Order</option>
                <option value="abandoned">Client Chose Not to Pursue Further</option>
                <option value="other">Other Resolution</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Resolution Outcome Summary
              </label>
              <input
                type="text"
                required
                value={outcome}
                onChange={e => setOutcome(e.target.value)}
                placeholder="e.g. Landlord returned full security deposit of ₹75,000 via NEFT"
                className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Amount Recovered (₹)
                </label>
                <input
                  type="number"
                  value={amountRecovered}
                  onChange={e => setAmountRecovered(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 75000"
                  className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Amount Disputed / Forfeited (₹)
                </label>
                <input
                  type="number"
                  value={amountDisputed}
                  onChange={e => setAmountDisputed(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 0"
                  className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Settlement Notes & Terms
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Mutual release deed executed. Keys handed over on 02 Oct 2026."
                className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                {submitting ? 'Recording...' : 'Mark as Resolved'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
