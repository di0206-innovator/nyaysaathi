'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Matter } from '@/types/matter';
import { formatCurrencyINR, formatDateIndian } from '@/lib/utils';
import {
  FolderLock,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Calendar,
  IndianRupee,
  MapPin,
  Scale
} from 'lucide-react';

export default function MattersListingPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch('/api/matters');
        const data = await res.json();
        if (isMounted && data.success) {
          setMatters(data.data);
        }
      } catch (err) {
        console.error('Failed to load matters', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMatters = matters.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userStory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.locationCity && m.locationCity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center space-x-2.5">
              <FolderLock className="w-7 h-7 text-amber-600" />
              <span>My Legal Matters</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Active and archived legal dispute dossiers, timelines, and notice drafts.
            </p>
          </div>

          <Link
            href="/matters/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-900/20 active:scale-98 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-stone-950" />
            <span>Start New Matter</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, city, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
            >
              <option value="all">All Categories</option>
              <option value="tenancy_housing">Tenancy & Housing</option>
              <option value="consumer_dispute">Consumer Disputes (CPA 2019)</option>
              <option value="workplace_employment">Workplace & Salary</option>
              <option value="financial_cheque_bounce">Cheque Bounce (Sec 138)</option>
              <option value="property_rera">Property & RERA</option>
              <option value="cyber_fraud">Cyber Fraud & Scams</option>
              <option value="other">Other Matters</option>
            </select>
          </div>
        </div>

        {/* Matters Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Scale className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading your legal matters...</p>
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <FolderLock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No matters found</h3>
            <p className="text-xs text-stone-500">
              No matching matters found for your search. Start a new matter to begin organizing your case.
            </p>
            <Link
              href="/matters/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Matter</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatters.map((matter) => (
              <Link
                key={matter.id}
                href={`/matters/${matter.id}`}
                className="bg-white rounded-2xl border border-stone-200 hover:border-amber-500 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                      {matter.category.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Action Ready
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {matter.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {matter.summary?.plainLanguage || matter.userStory}
                  </p>

                  <div className="pt-2 border-t border-stone-100 space-y-1.5 text-[11px] text-stone-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{formatDateIndian(matter.createdAt)}</span>
                      </span>
                      {matter.claimAmount !== undefined && (
                        <span className="font-bold text-stone-900 flex items-center space-x-0.5">
                          <IndianRupee className="w-3 h-3 text-amber-700" />
                          <span>{formatCurrencyINR(matter.claimAmount)}</span>
                        </span>
                      )}
                    </div>
                    {matter.locationCity && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{matter.locationCity}, {matter.locationState}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                  <span>Open Dossier</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
