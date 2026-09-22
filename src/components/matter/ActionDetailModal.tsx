'use client';

import React, { useState } from 'react';
import { ActionStep, ActionStatus, ActionResult } from '@/types/matter';
import { apiFetch } from '@/lib/api/client';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Upload,
  ArrowRight
} from 'lucide-react';

interface ActionDetailModalProps {
  matterId: string;
  action: ActionStep;
  isOpen: boolean;
  onClose: () => void;
  onActionUpdated: (updatedAction: ActionStep) => void;
  onNavigateToUpload?: () => void;
}

export function ActionDetailModal({
  matterId,
  action,
  isOpen,
  onClose,
  onActionUpdated,
  onNavigateToUpload
}: ActionDetailModalProps) {
  const [status, setStatus] = useState<ActionStatus>(action.status || 'pending');
  const [blockingReason, setBlockingReason] = useState(action.blockingReason || '');
  const [notes, setNotes] = useState(action.notes || '');
  const [result, setResult] = useState<ActionResult | ''>(action.result || '');
  const [proofType, setProofType] = useState<string>(action.completionProof?.type || 'receipt');
  const [proofReference, setProofReference] = useState(action.completionProof?.reference || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data, error: apiErr, ok } = await apiFetch(`/api/matters/${matterId}/actions`, {
        method: 'PATCH',
        body: JSON.stringify({
          actionId: action.id,
          status,
          blockingReason: status === 'blocked' ? blockingReason : undefined,
          notes,
          result: result || undefined,
          completionProof: status === 'completed' ? {
            type: proofType,
            reference: proofReference,
            notes
          } : undefined
        })
      });

      if (!ok || apiErr || !data) {
        throw new Error(apiErr || 'Failed to update action');
      }

      onActionUpdated((data as { action: ActionStep }).action);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating action');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-md border ${
              status === 'completed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : status === 'blocked'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : status === 'in_progress'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-stone-500 font-medium">Turnaround: {action.estimatedTurnaround}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close action details"
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 id="action-detail-title" className="text-xl font-bold text-stone-900">{action.title}</h2>
            <p className="text-sm text-stone-600 mt-1">{action.description}</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Execution Steps */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Execution Steps & Legal Best Practice</span>
            </h3>
            <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside">
              <li>Review generated legal notice or demand statement in Draft Studio.</li>
              <li>Verify recipient addresses and legal entity registrations.</li>
              <li>Dispatch via India Post Registered Post with Acknowledgment Due (RPAD) or Speed Post.</li>
              <li>Record India Post consignment tracking number and upload dispatch receipt.</li>
              <li>Mark action as completed to track the 15-day notice response window.</li>
            </ol>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-2">
              Action Status
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['pending', 'in_progress', 'blocked', 'completed', 'skipped'] as ActionStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-center capitalize ${
                    status === st
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Blocked Reason Input */}
          {status === 'blocked' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-rose-900">
                Reason for Block / Dependency
              </label>
              <input
                type="text"
                value={blockingReason}
                onChange={e => setBlockingReason(e.target.value)}
                placeholder="e.g. Awaiting verification of landlord postal address"
                className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
              {onNavigateToUpload && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToUpload();
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs text-rose-700 font-semibold hover:underline mt-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload missing corroborating document to unblock</span>
                </button>
              )}
            </div>
          )}

          {/* Completion Proof (When Completed) */}
          {status === 'completed' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proof of Execution</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Proof Type
                  </label>
                  <select
                    value={proofType}
                    onChange={e => setProofType(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg"
                  >
                    <option value="receipt">Speed Post / RPAD Receipt</option>
                    <option value="reference_number">Consignment Tracking Number</option>
                    <option value="screenshot">WhatsApp / Email Delivery Slip</option>
                    <option value="document">Bank Transaction / Payment Slip</option>
                    <option value="note">Written Confirmation Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Reference / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={proofReference}
                    onChange={e => setProofReference(e.target.value)}
                    placeholder="e.g. EK123456789IN"
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* What Happened / Result */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
              Outcome / Response Observed
            </label>
            <select
              value={result}
              onChange={e => setResult(e.target.value as ActionResult)}
              className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
            >
              <option value="">-- Select observed response --</option>
              <option value="awaiting_response">Awaiting Response from Counterparty</option>
              <option value="completed">Satisfactorily Completed / Delivered</option>
              <option value="partially_completed">Partial Response / Promise Received</option>
              <option value="rejected">Counterparty Rejected / Refused Delivery</option>
              <option value="no_response">No Response after Notice Period</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
              Personal Notes & Diary Entry
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Record any details about counterparty reaction, postal tracking updates, or lawyer discussions..."
              className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-2 transition-colors"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>Save Action Progress</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
