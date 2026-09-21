'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionStep } from '@/types/matter';
import { ActionDetailModal } from './ActionDetailModal';
import {
  Clock,
  ArrowRight,
  FileEdit,
  Flame,
  AlertTriangle,
  ChevronRight,
  FileCheck2
} from 'lucide-react';

interface ActionChecklistProps {
  matterId: string;
  steps: ActionStep[];
  onStepToggle?: (stepId: string, currentStatus: string) => Promise<void>;
  onNavigateToUpload?: () => void;
}

export function ActionChecklist({ matterId, steps, onNavigateToUpload }: ActionChecklistProps) {
  const [localSteps, setLocalSteps] = useState(steps);
  const [selectedAction, setSelectedAction] = useState<ActionStep | null>(null);

  const handleActionUpdated = (updatedAction: ActionStep) => {
    setLocalSteps(prev =>
      prev.map(s => (s.id === updatedAction.id ? updatedAction : s))
    );
  };

  const phases = [
    {
      id: 'immediate_48h',
      title: 'Phase 1: Immediate Steps (0-48 Hours)',
      subtitle: 'Preserve evidence, stop clock, and issue initial written notice.',
      badge: 'Immediate',
      color: 'border-orange-200 bg-orange-50/40 text-orange-950'
    },
    {
      id: 'short_term_14d',
      title: 'Phase 2: Short-Term Actions (1-14 Days)',
      subtitle: 'Formal registered legal notices and pre-litigation conciliation.',
      badge: '1-2 Weeks',
      color: 'border-amber-200 bg-amber-50/40 text-amber-950'
    },
    {
      id: 'formal_escalation',
      title: 'Phase 3: Formal Escalation & Portals',
      subtitle: 'e-Daakhil consumer commission, DLSA Legal Aid, or court plaint.',
      badge: 'Escalation',
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-950'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 pb-4 border-b border-black gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">OPERATIONAL PROTOCOL</div>
              <h3 className="font-mono font-bold text-base uppercase text-black">Executable Action Workspace</h3>
              <p className="text-xs text-stone-600 font-sans mt-0.5">
                Click any step to open the execution checklist, attach postal receipts, or mark completion.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 bg-black text-white self-start sm:self-auto">
            STATUS: {localSteps.filter(s => s.status === 'completed').length} / {localSteps.length} COMPLETED
          </div>
        </div>

        {/* Phase Groups */}
        <div className="space-y-6">
          {phases.map(phase => {
            const phaseSteps = localSteps.filter(s => s.phase === phase.id);
            if (phaseSteps.length === 0) return null;

            return (
              <div key={phase.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-black/20 pb-2">
                  <div>
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-black">
                      {phase.title}
                    </h4>
                    <p className="text-[11px] text-stone-600 font-sans">{phase.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-stone-100 text-black border border-black">
                    {phase.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  {phaseSteps.map(step => {
                    const isDone = step.status === 'completed';
                    const isBlocked = step.status === 'blocked';
                    const isInProgress = step.status === 'in_progress';

                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedAction(step)}
                        className={`p-4 border transition-all cursor-pointer flex items-start space-x-3.5 group ${
                          isDone
                            ? 'bg-stone-50 border-black/20 opacity-70'
                            : isBlocked
                            ? 'bg-stone-50 border-rose-600 border-l-4'
                            : isInProgress
                            ? 'bg-white border-black border-l-4'
                            : 'bg-white border-black/30 hover:border-black'
                        }`}
                      >
                        {/* Checkbox button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAction(step);
                          }}
                          aria-label={`Update action step: ${step.title}`}
                          className="mt-0.5 text-stone-400 hover:text-black transition-colors shrink-0"
                        >
                          {isDone ? (
                            <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
                              ✓
                            </div>
                          ) : isBlocked ? (
                            <div className="w-5 h-5 bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                              !
                            </div>
                          ) : (
                            <div className="w-5 h-5 border border-black bg-white group-hover:border-rose-600" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs font-bold uppercase tracking-tight ${
                                  isDone ? 'line-through text-stone-400' : 'text-black'
                                }`}
                              >
                                {step.title}
                              </span>
                              {step.priority === 'must_do' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-0.5">
                                  <Flame className="w-2.5 h-2.5" />
                                  <span>Priority</span>
                                </span>
                              )}
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isBlocked
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : isInProgress
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-stone-100 text-stone-600 border-stone-200'
                              }`}>
                                {step.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <span className="text-[11px] text-stone-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>Est: {step.estimatedTurnaround}</span>
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Blocked alert */}
                          {isBlocked && step.blockingReason && (
                            <div className="text-[11px] text-rose-800 bg-rose-50 p-1.5 rounded border border-rose-200 flex items-center space-x-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Blocked: {step.blockingReason}</span>
                            </div>
                          )}

                          {/* Completion Proof display */}
                          {step.completionProof && (
                            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 flex items-center space-x-1.5 font-mono">
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Proof Attached: {step.completionProof.type} ({step.completionProof.reference || 'Recorded'})</span>
                            </div>
                          )}

                          {step.associatedDraftType && (
                            <div className="pt-1 flex items-center justify-between">
                              <Link
                                href={`/matters/${matterId}#drafts`}
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                                <span>Open Generated Legal Notice / Draft</span>
                                <ArrowRight className="w-3 h-3 ml-0.5" />
                              </Link>
                              <span className="text-[10px] text-stone-400 group-hover:text-amber-600 flex items-center">
                                View Execution Details <ChevronRight className="w-3 h-3 ml-0.5" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Detail Execution Modal */}
      {selectedAction && (
        <ActionDetailModal
          matterId={matterId}
          action={selectedAction}
          isOpen={Boolean(selectedAction)}
          onClose={() => setSelectedAction(null)}
          onActionUpdated={handleActionUpdated}
          onNavigateToUpload={onNavigateToUpload}
        />
      )}
    </div>
  );
}
