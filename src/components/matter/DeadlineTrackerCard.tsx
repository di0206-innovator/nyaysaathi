'use client';

import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { CalculatedDeadline } from '@/lib/deadlines/deadline-engine';
import { useToast } from '@/components/ui/Toast';

interface DeadlineTrackerCardProps {
  deadlines: CalculatedDeadline[];
}

export function DeadlineTrackerCard({ deadlines }: DeadlineTrackerCardProps) {
  const { showToast } = useToast();

  if (deadlines.length === 0) {
    return (
      <div className="bg-white border border-black p-8 text-center text-stone-600 font-mono text-xs">
        <CheckCircle2 className="w-8 h-8 text-black mx-auto mb-2" />
        <p className="font-bold uppercase text-black">NO URGENT STATUTORY DEADLINES PENDING</p>
        <p className="text-[11px] text-stone-500">All procedural limitation periods and response windows remain compliant.</p>
      </div>
    );
  }

  const criticalCount = deadlines.filter(d => d.urgency === 'critical').length;

  return (
    <div className="bg-white border border-black p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
            02
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">STATUTORY SCHEDULE</div>
            <h3 className="font-mono font-bold text-base uppercase text-black">Statutory Deadlines & Procedural Windows</h3>
            <p className="text-xs text-stone-600 font-sans">Track limitation periods, notice response days, and follow-up milestones.</p>
          </div>
        </div>

        {criticalCount > 0 && (
          <span className="px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center space-x-1.5 self-start sm:self-auto">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>CRITICAL: {criticalCount} DEADLINE{criticalCount > 1 ? 'S' : ''} ACTIVE</span>
          </span>
        )}
      </div>

      {/* Deadline Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deadlines.map((item) => {
          const isCrit = item.urgency === 'critical';
          const isWarn = item.urgency === 'warning';

          return (
            <div
              key={item.id}
              className={`p-5 border transition-all text-xs space-y-3 ${
                isCrit
                  ? 'bg-stone-50 border-rose-600 border-l-4'
                  : isWarn
                  ? 'bg-stone-50 border-black border-l-4'
                  : 'bg-white border-black/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                    CATEGORY: {item.category.replace(/_/g, ' ')}
                  </span>
                  <h4 className="font-mono font-bold text-xs uppercase text-black">{item.title}</h4>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isCrit
                        ? 'bg-rose-600 text-white'
                        : isWarn
                        ? 'bg-black text-white'
                        : 'bg-stone-200 text-black'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{item.daysRemaining} DAYS REMAINING</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5 uppercase">DUE DATE: {item.dueDate}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-stone-800 font-sans">
                <p>
                  <strong className="font-mono uppercase text-[11px] text-black">Legal Basis:</strong> {item.statuteBasis}
                </p>
                <p>
                  <strong className="font-mono uppercase text-[11px] text-black">Consequence:</strong> {item.consequenceIfMissed}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-black/10 font-mono">
                <span className="text-stone-700 truncate pr-2">
                  <strong className="text-black uppercase">Action:</strong> {item.recommendedAction}
                </span>
                <button
                  type="button"
                  onClick={() => showToast('info', 'Procedural Reminder Set', `Reminder active for: ${item.title}`)}
                  className="px-2.5 py-1 bg-black hover:bg-rose-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center space-x-1 transition-colors"
                >
                  <Bell className="w-3 h-3 text-white" />
                  <span>REMIND</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
