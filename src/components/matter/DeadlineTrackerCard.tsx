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
      <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-stone-500 text-xs">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="font-semibold text-stone-800">No urgent deadlines pending</p>
        <p className="text-[11px]">All procedural windows and limitation periods are in order.</p>
      </div>
    );
  }

  const criticalCount = deadlines.filter(d => d.urgency === 'critical').length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">Statutory Deadlines & Procedural Windows</h3>
            <p className="text-[11px] text-stone-500">Track limitation periods, notice response days, and follow-up milestones.</p>
          </div>
        </div>

        {criticalCount > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{criticalCount} Critical Deadline{criticalCount > 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      {/* Deadline Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {deadlines.map((item) => {
          const isCrit = item.urgency === 'critical';
          const isWarn = item.urgency === 'warning';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                isCrit
                  ? 'bg-red-50/60 border-red-200 text-red-950'
                  : isWarn
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                  : 'bg-stone-50/80 border-stone-200 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <h4 className="font-bold text-xs text-stone-900">{item.title}</h4>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isCrit
                        ? 'bg-red-200 text-red-900'
                        : isWarn
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{item.daysRemaining} days left</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Due: {item.dueDate}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-stone-700 pt-1 border-t border-stone-200/60">
                <p>
                  <strong className="font-semibold text-stone-900">Legal Basis:</strong> {item.statuteBasis}
                </p>
                <p>
                  <strong className="font-semibold text-stone-900">Consequence:</strong> {item.consequenceIfMissed}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-stone-200/60">
                <span className="text-stone-600 truncate pr-2">
                  <strong>Action:</strong> {item.recommendedAction}
                </span>
                <button
                  type="button"
                  onClick={() => showToast('info', 'Procedural Reminder Set', `Reminder active for: ${item.title}`)}
                  className="px-2 py-1 rounded-md bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold shrink-0 flex items-center space-x-1 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <Bell className="w-3 h-3 text-amber-600" />
                  <span>Remind</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
