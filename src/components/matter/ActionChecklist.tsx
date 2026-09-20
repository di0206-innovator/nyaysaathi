'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionStep } from '@/types/matter';
import { ActionDetailModal } from './ActionDetailModal';
import {
  Circle,
  Clock,
  ArrowRight,
  Sparkles,
  FileEdit,
  Flame,
  Check,
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
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Executable Action Workspace</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any step to open the execution checklist, attach postal receipts, or mark completion.
            </p>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
            {localSteps.filter(s => s.status === 'completed').length} / {localSteps.length} Done
          </div>
        </div>

        {/* Phase Groups */}
        <div className="space-y-6">
          {phases.map(phase => {
            const phaseSteps = localSteps.filter(s => s.phase === phase.id);
            if (phaseSteps.length === 0) return null;

            return (
              <div key={phase.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      {phase.title}
                    </h4>
                    <p className="text-[11px] text-stone-500">{phase.subtitle}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                    {phase.badge}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {phaseSteps.map(step => {
                    const isDone = step.status === 'completed';
                    const isBlocked = step.status === 'blocked';
                    const isInProgress = step.status === 'in_progress';

                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedAction(step)}
                        className={`rounded-lg p-3.5 border transition-all cursor-pointer flex items-start space-x-3 group ${
                          isDone
                            ? 'bg-stone-50/80 border-stone-200 opacity-80'
                            : isBlocked
                            ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300 shadow-2xs'
                            : isInProgress
                            ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300 shadow-2xs'
                            : 'bg-white border-stone-200/90 hover:border-amber-400 shadow-2xs'
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
                          className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                        >
                          {isDone ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : isBlocked ? (
                            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                              <AlertTriangle className="w-3 h-3" />
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-stone-400" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs font-bold ${
                                  isDone ? 'line-through text-stone-500' : 'text-stone-900'
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
