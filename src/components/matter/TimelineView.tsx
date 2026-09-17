'use client';

import React from 'react';
import { TimelineEvent } from '@/types/matter';
import { formatDateIndian } from '@/lib/utils';
import {
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  Milestone
} from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  identifiedGaps?: string[];
}

export function TimelineView({ events, identifiedGaps }: TimelineViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-700" />
              <span>Chronological Timeline of Events</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Strict chronological sequence establishing causality, notice dates, and limitation periods.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
            {events.length} Milestones Recorded
          </span>
        </div>

        {/* Chronology Line */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {events.map((event, index) => {
            return (
              <div key={event.id || index} className="relative group">
                {/* Node marker */}
                <div
                  className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center ${
                    event.isKeyMilestone
                      ? 'bg-amber-600 ring-2 ring-amber-200'
                      : 'bg-stone-500'
                  }`}
                />

                <div className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200/80 group-hover:border-stone-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900">
                        {event.title}
                      </span>
                      {event.isKeyMilestone && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                          <Milestone className="w-2.5 h-2.5" />
                          <span>Key Milestone</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-stone-600 flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-stone-200 shrink-0">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{formatDateIndian(event.date)}</span>
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed mb-2">
                    {event.description}
                  </p>

                  {event.evidenceTitle && (
                    <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded bg-white text-stone-700 text-[11px] border border-stone-200 shadow-2xs">
                      <FileText className="w-3 h-3 text-amber-700" />
                      <span>Backed by Evidence: <strong>{event.evidenceTitle}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Identified Timeline Gaps */}
      {identifiedGaps && identifiedGaps.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Timeline Gap Alerts
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Our analysis identified the following missing documentary dates or steps that could strengthen your timeline:
              </p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {identifiedGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
