'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Matter } from '@/types/matter';
import { formatCurrencyINR, formatDateIndian } from '@/lib/utils';
import {
  FolderLock,
  Plus,
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
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userStory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.locationCity && m.locationCity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;

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
    <div className="min-h-screen bg-[#FBFBF9] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header - Swiss Gazette Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#0A0A0A]">
          <div>
            <div className="flex items-center space-x-2 text-rose-600 font-mono text-xs font-bold uppercase tracking-widest mb-1">
              <FolderLock className="w-4 h-4 text-rose-600" />
              <span>JUDICIAL ACTION WORKSPACE // DOCKET REGISTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Personal Legal Matters
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-mono mt-1 uppercase">
              Active case dossiers, limitation countdowns, and pre-litigation document generation.
            </p>
          </div>

          <Link
            href="/matters/new"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors border border-black shadow-none self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Initialize Matter</span>
          </Link>
        </div>

        {/* 5-Column Metric Steppers - Swiss Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border border-[#0A0A0A] divide-x divide-y sm:divide-y-0 divide-[#0A0A0A] bg-white">
          <button
            onClick={() => setDashboardFilter('all_active')}
            className={`p-4 text-left transition-colors font-mono ${
              dashboardFilter === 'all_active'
                ? 'bg-[#0A0A0A] text-white'
                : 'bg-white text-stone-900 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>01 // Active</span>
              <Scale className="w-3.5 h-3.5" />
            </div>
            <p className="text-3xl font-black mt-3">{activeMatters.length}</p>
          </button>

          <button
            onClick={() => setDashboardFilter('needs_attention')}
            className={`p-4 text-left transition-colors font-mono ${
              dashboardFilter === 'needs_attention'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-stone-900 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>02 // Action Due</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-3xl font-black mt-3 text-rose-600 group-hover:text-white">
              {needsAttention.length}
            </p>
          </button>

          <button
            onClick={() => setDashboardFilter('waiting_for')}
            className={`p-4 text-left transition-colors font-mono ${
              dashboardFilter === 'waiting_for'
                ? 'bg-[#0A0A0A] text-white'
                : 'bg-white text-stone-900 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>03 // Waiting</span>
              <Send className="w-3.5 h-3.5" />
            </div>
            <p className="text-3xl font-black mt-3">{waitingFor.length}</p>
          </button>

          <button
            onClick={() => setDashboardFilter('upcoming_deadlines')}
            className={`p-4 text-left transition-colors font-mono ${
              dashboardFilter === 'upcoming_deadlines'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-900 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>04 // Deadlines</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-3xl font-black mt-3">{upcomingDeadlinesMatters.length}</p>
          </button>

          <button
            onClick={() => setDashboardFilter('resolved')}
            className={`p-4 text-left transition-colors font-mono col-span-2 sm:col-span-1 ${
              dashboardFilter === 'resolved'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-stone-900 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>05 // Resolved</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black mt-3">{resolvedMatters.length}</p>
          </button>
        </div>

        {/* Search & Filter Bar - Swiss Design */}
        <div className="bg-white p-3 border border-[#0A0A0A] flex flex-col md:flex-row items-center gap-3 font-mono text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH DOCKET BY KEYWORD, CITATION, OR CITY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-black bg-[#FBFBF9] uppercase text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 border border-stone-300 bg-[#FBFBF9] focus:outline-none focus:ring-2 focus:ring-black w-full md:w-auto font-mono uppercase"
            >
              <option value="all">ALL LEGAL CATEGORIES</option>
              <option value="tenancy_housing">TENANCY &amp; HOUSING</option>
              <option value="consumer_dispute">CONSUMER DEFICIENCY</option>
              <option value="employment_wages">SALARY &amp; WORKPLACE</option>
              <option value="builder_rera">RERA FLAT POSSESSION</option>
              <option value="cheque_bounce">CHEQUE DISHONOR (SEC 138)</option>
              <option value="financial_fraud">CYBER / FINANCIAL FRAUD</option>
            </select>
          </div>
        </div>

        {/* Matters Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3 font-mono">
            <Scale className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-600 uppercase tracking-wider">RETRIEVING CASE DOSSIERS...</p>
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#0A0A0A] space-y-3 font-mono">
            <Scale className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold uppercase text-stone-900">No matching dockets found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto uppercase">
              No cases correspond to the active filter configuration.
            </p>
            <button
              onClick={() => {
                setDashboardFilter('all_active');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 font-bold hover:underline uppercase"
            >
              [Reset Filters]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatters.map((matter, idx) => {
              const completedActions = matter.actionPlan?.filter(a => a.status === 'completed').length || 0;
              const totalActions = matter.actionPlan?.length || 0;

              return (
                <Link
                  key={matter.id}
                  href={`/matters/${matter.id}`}
                  className="group bg-white border border-[#0A0A0A] hover:border-rose-600 p-5 transition-all flex flex-col justify-between space-y-4 hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2.5 font-mono text-[10px]">
                      <span className="font-bold text-rose-600 uppercase tracking-wider">
                        DOCKET #{idx + 1} {'//'} {matter.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                        matter.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : matter.status === 'awaiting_other_party'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : matter.status === 'awaiting_user_action'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-stone-100 text-stone-700 border-stone-300'
                      }`}>
                        [{matter.status.replace(/_/g, ' ')}]
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0A0A0A] group-hover:text-rose-600 transition-colors line-clamp-1 uppercase">
                        {matter.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                        {matter.summary?.plainLanguage || matter.userStory}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-stone-600 font-mono pt-1">
                      {matter.locationCity && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{matter.locationCity}</span>
                        </span>
                      )}
                      {matter.claimAmount && (
                        <span className="flex items-center space-x-1 font-bold text-stone-900 bg-amber-50 px-1 border border-amber-200">
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
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-stone-600 flex items-center space-x-1">
                      <ListTodo className="w-3.5 h-3.5 text-stone-400" />
                      <span>{completedActions}/{totalActions} ACTIONS COMPLETED</span>
                    </span>
                    <span className="text-rose-600 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1 uppercase">
                      <span>OPEN DOSSIER</span>
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
