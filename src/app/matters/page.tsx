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
  Scale,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  ListTodo
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

type DashboardFilter = 'all_active' | 'needs_attention' | 'waiting_for' | 'upcoming_deadlines' | 'resolved';

export default function MattersListingPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilter>('all_active');
  const { token, user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (user?.id) headers['x-user-id'] = user.id;

        const res = await fetch('/api/matters', { headers });
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
  }, [token, user?.id]);

  // Derived Dashboard Metrics
  const activeMatters = matters.filter(m => m.status !== 'resolved' && m.status !== 'closed');
  const needsAttention = matters.filter(m =>
    m.status === 'awaiting_user_action' ||
    m.actionPlan?.some(a => a.status === 'blocked' || a.priority === 'must_do' && a.status !== 'completed')
  );
  const waitingFor = matters.filter(m =>
    m.status === 'awaiting_other_party' ||
    m.status === 'awaiting_authority' ||
    m.status === 'in_mediation'
  );
  const resolvedMatters = matters.filter(m => m.status === 'resolved' || m.status === 'closed');

  const now = new Date();
  const upcomingDeadlinesMatters = matters.filter(m =>
    m.deadlines?.some(d => {
      const diff = new Date(d.dueDate).getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30 && d.status === 'active';
    })
  );

  const filteredMatters = matters.filter(m => {
    // 1. Search Query
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userStory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.locationCity && m.locationCity.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Category Filter
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;

    // 3. Dashboard Quick Filter
    let matchesDashboard = true;
    if (dashboardFilter === 'all_active') {
      matchesDashboard = m.status !== 'resolved' && m.status !== 'closed';
    } else if (dashboardFilter === 'needs_attention') {
      matchesDashboard = needsAttention.some(n => n.id === m.id);
    } else if (dashboardFilter === 'waiting_for') {
      matchesDashboard = waitingFor.some(w => w.id === m.id);
    } else if (dashboardFilter === 'upcoming_deadlines') {
      matchesDashboard = upcomingDeadlinesMatters.some(u => u.id === m.id);
    } else if (dashboardFilter === 'resolved') {
      matchesDashboard = m.status === 'resolved' || m.status === 'closed';
    }

    return matchesSearch && matchesCat && matchesDashboard;
  });

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center space-x-2.5">
              <FolderLock className="w-7 h-7 text-amber-600" />
              <span>Personal Legal Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Active matter dossiers, action tracking, statutory limitation windows, and resolution monitoring.
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

        {/* Actionable Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setDashboardFilter('all_active')}
            className={`p-4 rounded-xl border text-left transition-all ${
              dashboardFilter === 'all_active'
                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold opacity-70">Active Matters</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black mt-2">{activeMatters.length}</p>
          </button>

          <button
            onClick={() => setDashboardFilter('needs_attention')}
            className={`p-4 rounded-xl border text-left transition-all ${
              dashboardFilter === 'needs_attention'
                ? 'bg-rose-900 text-white border-rose-900 shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold opacity-80">Needs Attention</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black mt-2 text-rose-600 group-hover:text-rose-700">
              {needsAttention.length}
            </p>
          </button>

          <button
            onClick={() => setDashboardFilter('waiting_for')}
            className={`p-4 rounded-xl border text-left transition-all ${
              dashboardFilter === 'waiting_for'
                ? 'bg-blue-950 text-white border-blue-900 shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold opacity-80">Waiting For Reply</span>
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black mt-2 text-blue-600">
              {waitingFor.length}
            </p>
          </button>

          <button
            onClick={() => setDashboardFilter('upcoming_deadlines')}
            className={`p-4 rounded-xl border text-left transition-all ${
              dashboardFilter === 'upcoming_deadlines'
                ? 'bg-amber-900 text-white border-amber-900 shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold opacity-80">Upcoming Deadlines</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black mt-2 text-amber-600">
              {upcomingDeadlinesMatters.length}
            </p>
          </button>

          <button
            onClick={() => setDashboardFilter('resolved')}
            className={`p-4 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
              dashboardFilter === 'resolved'
                ? 'bg-emerald-950 text-white border-emerald-900 shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold opacity-80">Resolved Cases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black mt-2 text-emerald-600">
              {resolvedMatters.length}
            </p>
          </button>
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
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full md:w-auto"
            >
              <option value="all">All Legal Categories</option>
              <option value="tenancy_housing">Tenancy & Rental Housing</option>
              <option value="consumer_dispute">Consumer Grievance / Defective Goods</option>
              <option value="employment_wages">Salary Withholding & Labour</option>
              <option value="builder_rera">RERA & Real Estate Delayed Possession</option>
              <option value="cheque_bounce">Cheque Bounce (Sec 138 NI Act)</option>
              <option value="financial_fraud">UPI / Banking Cyber Fraud</option>
            </select>
          </div>
        </div>

        {/* Matters Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Scale className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-semibold">Loading case dossiers...</p>
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
            <Scale className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No matters matching filter</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No cases found for the selected dashboard view.
            </p>
            <button
              onClick={() => {
                setDashboardFilter('all_active');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatters.map((matter) => {
              const completedActions = matter.actionPlan?.filter(a => a.status === 'completed').length || 0;
              const totalActions = matter.actionPlan?.length || 0;

              return (
                <Link
                  key={matter.id}
                  href={`/matters/${matter.id}`}
                  className="group bg-white rounded-2xl border border-stone-200/90 p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {matter.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        matter.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : matter.status === 'awaiting_other_party'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : matter.status === 'awaiting_user_action'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}>
                        {matter.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                        {matter.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {matter.summary?.plainLanguage || matter.userStory}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-stone-500 pt-1">
                      {matter.locationCity && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{matter.locationCity}</span>
                        </span>
                      )}
                      {matter.claimAmount && (
                        <span className="flex items-center space-x-1 font-semibold text-stone-800">
                          <IndianRupee className="w-3 h-3 text-stone-400" />
                          <span>{formatCurrencyINR(matter.claimAmount)}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{formatDateIndian(matter.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 flex items-center space-x-1 font-medium">
                      <ListTodo className="w-3.5 h-3.5 text-stone-400" />
                      <span>{completedActions}/{totalActions} Actions Done</span>
                    </span>
                    <span className="text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
