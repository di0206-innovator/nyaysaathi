'use client';

import React, { useState } from 'react';
import { MatterActivityEvent, TimelineEvent } from '@/types/matter';
import {
  FileCheck2,
  UserCheck,
  Clock
} from 'lucide-react';

interface ActivityTimelineProps {
  historicalEvents: TimelineEvent[];
  activityEvents: MatterActivityEvent[];
}

export function ActivityTimeline({
  historicalEvents,
  activityEvents
}: ActivityTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'evidence_derived' | 'user_recorded'>('all');

  // Normalize items into unified timeline entries
  interface UnifiedTimelineItem {
    id: string;
    date: string;
    title: string;
    description: string;
    source: 'evidence_derived' | 'user_recorded';
    status?: string;
    iconType: string;
  }

  const items: UnifiedTimelineItem[] = [
    ...historicalEvents.map(h => ({
      id: h.id,
      date: h.date,
      title: h.title,
      description: h.description,
      source: 'evidence_derived' as const,
      status: h.status,
      iconType: 'evidence'
    })),
    ...activityEvents.map(a => ({
      id: a.id,
      date: a.date.split('T')[0],
      title: a.title,
      description: a.description,
      source: 'user_recorded' as const,
      status: 'action_recorded',
      iconType: a.type
    }))
  ];

  // Sort descending by date
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = filter === 'all'
    ? items
    : items.filter(i => i.source === filter);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Matter Activity & Event Chronology</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Consolidated timeline clearly distinguishing evidence-verified historical facts from ongoing user execution events.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('evidence_derived')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'evidence_derived' ? 'bg-white text-blue-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Evidence Facts ({historicalEvents.length})
          </button>
          <button
            onClick={() => setFilter('user_recorded')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'user_recorded' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Actions Taken ({activityEvents.length})
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-stone-500 text-xs">
          No events found under this filter.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-stone-200">
          {filteredItems.map(item => {
            const isEvidence = item.source === 'evidence_derived';

            return (
              <div key={item.id} className="relative group">
                {/* Bullet */}
                <div className={`absolute -left-[27px] top-0.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                  isEvidence ? 'border-blue-500 text-blue-600' : 'border-emerald-500 text-emerald-600'
                }`}>
                  {isEvidence ? (
                    <FileCheck2 className="w-3 h-3" />
                  ) : (
                    <UserCheck className="w-3 h-3" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-900">{item.title}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isEvidence
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {isEvidence ? 'Evidence Fact' : 'Action Recorded'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
