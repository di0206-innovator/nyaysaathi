'use client';

import React, { useState } from 'react';
import { Matter, GroundingStatus } from '@/types/matter';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  HelpCircle,
  Upload,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';

interface GroundingExplorerProps {
  matter: Matter;
  onUploadClick?: () => void;
}

export function GroundingExplorer({ matter, onUploadClick }: GroundingExplorerProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | GroundingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Compile all key evaluatable items with their grounding status
  const items: Array<{
    id: string;
    type: 'claim' | 'risk' | 'action' | 'draft' | 'fact';
    title: string;
    description: string;
    groundingStatus: GroundingStatus;
    groundingRefIds: string[];
    suggestedDoc?: string;
  }> = [
    {
      id: 'claim-core',
      type: 'claim',
      title: 'Initial Narrative Claim',
      description: matter.userStory.slice(0, 160) + '...',
      groundingStatus: matter.documents.length > 0 ? 'grounded' : 'partially_grounded',
      groundingRefIds: matter.documents.map(d => d.id)
    },
    ...matter.facts.map(f => ({
      id: f.id,
      type: 'fact' as const,
      title: `Verified Fact (${f.category.toUpperCase()})`,
      description: f.statement,
      groundingStatus: (f.sourceDocId ? 'grounded' : 'partially_grounded') as GroundingStatus,
      groundingRefIds: f.sourceDocId ? [f.sourceDocId] : []
    })),
    ...matter.risks.map(r => ({
      id: r.id,
      type: 'risk' as const,
      title: r.title,
      description: r.description,
      groundingStatus: r.groundingStatus || (matter.documents.length > 0 ? 'grounded' : 'partially_grounded'),
      groundingRefIds: r.groundingRefIds || [],
      suggestedDoc: r.groundingStatus === 'unsupported' ? 'Formal postal dispatch tracking slip or GST repair invoice' : undefined
    })),
    ...matter.actionPlan.map(a => ({
      id: a.id,
      type: 'action' as const,
      title: a.title,
      description: a.description,
      groundingStatus: a.groundingStatus || 'grounded',
      groundingRefIds: a.groundingRefIds || []
    })),
    ...matter.drafts.map(d => ({
      id: d.id,
      type: 'draft' as const,
      title: `${d.title} (${d.communicationTier.toUpperCase()})`,
      description: d.subject,
      groundingStatus: d.groundingStatus || 'grounded',
      groundingRefIds: d.groundingRefIds || []
    }))
  ];

  const groundedCount = items.filter(i => i.groundingStatus === 'grounded').length;
  const partialCount = items.filter(i => i.groundingStatus === 'partially_grounded').length;
  const unsupportedCount = items.filter(i => i.groundingStatus === 'unsupported').length;

  const filteredItems = items.filter(item => {
    const matchesFilter = statusFilter === 'all' || item.groundingStatus === statusFilter;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6" id="grounding-explorer">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base text-stone-900">
                Evidence Graph & Grounding Explorer
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              NyaySaathi strictly enforces that all risks, actions, and draft claims are grounded by uploaded evidence or codified statutes.
            </p>
          </div>

          {/* Quick Stats Pill Counters */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{groundedCount} Grounded</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{partialCount} Partial</span>
            </span>
            {unsupportedCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-semibold border border-rose-200 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{unsupportedCount} Unsupported</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('grounded')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'grounded'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Grounded ({groundedCount})
            </button>
            <button
              onClick={() => setStatusFilter('partially_grounded')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'partially_grounded'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              Partially Grounded ({partialCount})
            </button>
            <button
              onClick={() => setStatusFilter('unsupported')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'unsupported'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              Unsupported ({unsupportedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search claims & proof..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Grounding Items List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          let statusLabel = 'Grounded in Documents';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;

          if (item.groundingStatus === 'partially_grounded') {
            badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
            statusLabel = 'Partially Grounded (Corroboration Advised)';
            icon = <HelpCircle className="w-4 h-4 text-amber-600" />;
          } else if (item.groundingStatus === 'unsupported') {
            badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
            statusLabel = 'Unsupported Assertion (Missing Proof)';
            icon = <AlertTriangle className="w-4 h-4 text-rose-600" />;
          }

          const isExpanded = selectedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border transition-all p-4 shadow-2xs ${
                isExpanded ? 'border-amber-400 ring-1 ring-amber-400/20' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                        {statusLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 uppercase">
                        Type: {item.type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-stone-900">{item.title}</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItemId(isExpanded ? null : item.id)}
                  className="self-start sm:self-center shrink-0 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors inline-flex items-center space-x-1"
                >
                  <span>{isExpanded ? 'Hide Evidence Tree' : 'View Grounding'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Expandable Evidentiary Grounding Inspector */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 bg-stone-50/70 p-3.5 rounded-lg text-xs">
                  <div className="font-semibold text-stone-800 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Supporting Evidence & Grounded Artifacts</span>
                  </div>

                  {item.groundingRefIds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.groundingRefIds.map((refId, idx) => {
                        const matchingDoc = matter.documents.find(d => d.id === refId);
                        const matchingFact = matter.facts.find(f => f.id === refId);

                        return (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-lg border border-stone-200 text-stone-700 shadow-2xs"
                          >
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded mr-1.5">
                              {matchingDoc ? 'DOCUMENT' : matchingFact ? 'FACT' : 'STATUTORY SOURCE'}
                            </span>
                            <span className="font-medium text-stone-900">
                              {matchingDoc?.title || matchingFact?.statement || refId}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">
                      No direct documentary node linked yet. This item is classified under informational possibilities.
                    </p>
                  )}

                  {/* Missing Evidence Prompt if weak */}
                  {(item.groundingStatus === 'unsupported' || item.groundingStatus === 'partially_grounded') && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Missing Evidence Prompt: </span>
                          <span className="text-stone-700">
                            {item.suggestedDoc || 'Upload contemporary receipts, signed lease pages, or payment confirmation to elevate this item to verified evidentiary standing.'}
                          </span>
                        </div>
                      </div>

                      {onUploadClick && (
                        <button
                          onClick={onUploadClick}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Proof</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
