'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionStep } from '@/types/matter';
import {
  Circle,
  Clock,
  ArrowRight,
  Sparkles,
  FileEdit,
  Flame,
  Check
} from 'lucide-react';

interface ActionChecklistProps {
  matterId: string;
  steps: ActionStep[];
  onStepToggle?: (stepId: string, currentStatus: string) => Promise<void>;
}

export function ActionChecklist({ matterId, steps, onStepToggle }: ActionChecklistProps) {
  const [localSteps, setLocalSteps] = useState(steps);

  const toggleStep = async (stepId: string) => {
    const target = localSteps.find(s => s.id === stepId);
    if (!target) return;

    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    setLocalSteps(prev =>
      prev.map(s => (s.id === stepId ? { ...s, status: newStatus } : s))
    );

    if (onStepToggle) {
      await onStepToggle(stepId, target.status);
    }
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
              <span>What You Can Do Next (Phased Action Plan)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Structured step-by-step roadmap organized from urgent actions to formal dispute resolution.
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

                    return (
                      <div
                        key={step.id}
                        className={`rounded-lg p-3.5 border transition-all flex items-start space-x-3 ${
                          isDone
                            ? 'bg-stone-50 border-stone-200 opacity-75'
                            : 'bg-white border-stone-200/90 hover:border-amber-400 shadow-2xs'
                        }`}
                      >
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors"
                        >
                          {isDone ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
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
                            </div>

                            <span className="text-[11px] text-stone-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>Est: {step.estimatedTurnaround}</span>
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed">
                            {step.description}
                          </p>

                          {step.associatedDraftType && (
                            <div className="pt-1">
                              <Link
                                href={`/matters/${matterId}#drafts`}
                                className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                                <span>Open Generated Legal Notice / Draft</span>
                                <ArrowRight className="w-3 h-3 ml-0.5" />
                              </Link>
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
    </div>
  );
}
