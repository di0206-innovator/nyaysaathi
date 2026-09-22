'use client';

import React, { useState } from 'react';
import { CommunicationRecord, CommunicationType, CommunicationDirection } from '@/types/matter';
import { apiFetch } from '@/lib/api/client';
import {
  MessageSquare,
  Send,
  Inbox,
  AlertCircle,
  Plus,
  Mail,
  Phone,
  FileText,
  X
} from 'lucide-react';

interface CommunicationLogProps {
  matterId: string;
  communications: CommunicationRecord[];
  onCommunicationAdded?: (newComm: CommunicationRecord) => void;
}

export function CommunicationLog({
  matterId,
  communications,
  onCommunicationAdded
}: CommunicationLogProps) {
  const [comms, setComms] = useState<CommunicationRecord[]>(communications);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New communication form state
  const [type, setType] = useState<CommunicationType>('legal_notice');
  const [direction, setDirection] = useState<CommunicationDirection>('outgoing');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [counterparty, setCounterparty] = useState('');
  const [summary, setSummary] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [responseExpectedBy, setResponseExpectedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleRecordCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error, ok } = await apiFetch(`/api/matters/${matterId}/communications`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          direction,
          date,
          counterparty,
          summary,
          referenceNumber: referenceNumber || undefined,
          responseExpectedBy: responseExpectedBy || undefined,
          status: direction === 'outgoing' ? 'sent' : 'responded'
        })
      });

      if (!ok || error || !data) {
        throw new Error(error || 'Failed to record communication');
      }

      setComms(data.communications);
      if (onCommunicationAdded && data.communications?.[0]) {
        onCommunicationAdded(data.communications[0]);
      }
      setIsModalOpen(false);
      setSummary('');
      setReferenceNumber('');
      setCounterparty('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error recording communication');
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (commType: CommunicationType) => {
    switch (commType) {
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'phone_call': return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'legal_notice': return <FileText className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Communication & Notice Log</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Track legal notices, speed post consignments, emails, and counterparty responses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Interaction</span>
        </button>
      </div>

      {comms.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <MessageSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-700">No communication recorded yet</p>
          <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto">
            Log dispatch receipts for Speed Post notices, emails sent to authorities, or WhatsApp replies received.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            + Record First Communication
          </button>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {comms.map(c => {
            const isOutgoing = c.direction === 'outgoing';
            const expectedDate = c.responseExpectedBy ? new Date(c.responseExpectedBy) : null;
            const now = new Date();
            const daysLeft = expectedDate
              ? Math.ceil((expectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={c.id} className="py-3.5 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-stone-100 mt-0.5">
                    {getIcon(c.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900 capitalize">
                        {c.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 flex items-center space-x-1">
                        {isOutgoing ? <Send className="w-2.5 h-2.5" /> : <Inbox className="w-2.5 h-2.5" />}
                        <span>{isOutgoing ? `To: ${c.counterparty}` : `From: ${c.counterparty}`}</span>
                      </span>
                      <span className="text-[10px] text-stone-400">• {c.date}</span>
                    </div>
                    <p className="text-xs text-stone-700">{c.summary}</p>
                    {c.referenceNumber && (
                      <p className="text-[11px] text-stone-500 font-mono">
                        Consignment / Ref: <span className="font-bold text-stone-800">{c.referenceNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Response Tracking Status */}
                <div className="text-right shrink-0">
                  {daysLeft !== null && c.status !== 'responded' && c.status !== 'resolved' ? (
                    <div className="inline-flex flex-col items-end">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        daysLeft < 0
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : daysLeft <= 3
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)}d` : `Response in ${daysLeft}d`}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        Due: {c.responseExpectedBy}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Communication Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="comm-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 id="comm-modal-title" className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Record Legal Communication</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close communication modal"
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordCommunication} className="p-6 space-y-4">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as CommunicationType)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
                  >
                    <option value="legal_notice">Legal Notice (Speed Post/RPAD)</option>
                    <option value="email">Formal Email</option>
                    <option value="whatsapp">WhatsApp Written Communication</option>
                    <option value="phone_call">Phone Discussion</option>
                    <option value="complaint_filed">Formal Complaint Filed</option>
                    <option value="authority_response">Authority Notice / Summons</option>
                    <option value="payment_received">Payment / Settlement Received</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Direction</label>
                  <select
                    value={direction}
                    onChange={e => setDirection(e.target.value as CommunicationDirection)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
                  >
                    <option value="outgoing">Outgoing (Sent by Me)</option>
                    <option value="incoming">Incoming (Received from Other Party)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Counterparty / Recipient</label>
                  <input
                    type="text"
                    required
                    value={counterparty}
                    onChange={e => setCounterparty(e.target.value)}
                    placeholder="e.g. Landlord Ramesh Kumar"
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Summary of Communication</label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="e.g. Sent 15-day formal demand notice requesting refund of security deposit via Speed Post."
                  className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Consignment / Tracking Number</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    placeholder="e.g. EK987654321IN"
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Response Expected By</label>
                  <input
                    type="date"
                    value={responseExpectedBy}
                    onChange={e => setResponseExpectedBy(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Save Communication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
