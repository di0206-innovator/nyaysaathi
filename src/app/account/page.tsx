'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleExportData = async () => {
    try {
      setExporting(true);
      setExportError('');
      const res = await fetch('/api/account/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.success && json.data) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `nyaysaathi-account-export-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      }
    } catch {
      setExportError('Failed to export account data. Please check your network connection.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setDeleteError('Confirmation email does not match your active account email.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail })
      });
      const json = await res.json();
      if (json.success) {
        await logout();
        router.push('/');
      } else {
        setDeleteError(json.error || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('Network error while requesting deletion.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center font-mono">
        <p className="text-stone-400 animate-pulse uppercase tracking-widest text-xs">Authenticating user session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center font-mono space-y-4">
        <p className="text-stone-400 uppercase tracking-widest text-xs">No active session found</p>
        <Link href="/login?callbackUrl=/account" className="px-4 py-2 border border-rose-600 bg-stone-900 text-rose-400 text-xs uppercase hover:bg-stone-800 font-bold">
          Sign In to Access Account →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Swiss Header */}
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-mono text-sm font-bold tracking-wider uppercase text-white hover:text-rose-400">
              NYAYSAATHI
            </Link>
            <span className="text-stone-600 font-mono text-xs">/</span>
            <span className="font-mono text-xs text-stone-400 uppercase">Account Lifecycle &amp; Privacy</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/matters" className="px-3 py-1.5 border border-stone-800 text-xs font-mono uppercase text-stone-300 hover:bg-stone-900">
              Back to Matters
            </Link>
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 border border-rose-900/60 text-xs font-mono uppercase text-rose-400 hover:bg-rose-950/40"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Section 01: Profile Overview */}
        <section className="border border-stone-800 bg-stone-900/40 p-6 space-y-6">
          <div className="border-b border-stone-800 pb-4">
            <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">01 // IDENTITY CONTEXT</span>
            <h1 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Authenticated Account Profile</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="p-4 border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 uppercase tracking-wider">Account ID</span>
              <p className="text-stone-200 truncate">{user.id}</p>
            </div>
            <div className="p-4 border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 uppercase tracking-wider">Email Address</span>
              <p className="text-stone-200">{user.email}</p>
            </div>
            <div className="p-4 border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 uppercase tracking-wider">User Name</span>
              <p className="text-stone-200">{user.name || 'Unspecified'}</p>
            </div>
            <div className="p-4 border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 uppercase tracking-wider">Assigned Role</span>
              <p className="text-emerald-400 font-bold uppercase">{user.role || 'Citizen'}</p>
            </div>
          </div>
        </section>

        {/* Section 02: Privacy & Data Lifecycle */}
        <section className="border border-stone-800 bg-stone-900/40 p-6 space-y-6">
          <div className="border-b border-stone-800 pb-4">
            <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">02 // PRIVACY GOVERNANCE</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">DPDP Act 2023 Compliance Controls</h2>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed">
            In accordance with India&apos;s Digital Personal Data Protection Act (DPDP Act, 2023), you hold the right to
            access, port, and erase your personal data. All matters created under your identity are partitioned via Row-Level Security
            and accessible strictly through request-scoped credentials.
          </p>

          <div className="border border-stone-800 bg-stone-950 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm uppercase text-white">Export Portable Legal Record</h4>
                <p className="text-xs text-stone-400 mt-1">
                  Download a complete JSON export of your profile, matters, evidence timelines, actions, and generated legal notices.
                </p>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="px-4 py-2 border border-stone-700 bg-stone-900 hover:bg-stone-800 text-xs font-mono uppercase text-white tracking-wider whitespace-nowrap disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export My Data (JSON)'}
              </button>
            </div>

            {exportSuccess && (
              <div className="p-3 border border-emerald-800/80 bg-emerald-950/40 text-emerald-300 text-xs font-mono">
                Data export file successfully assembled and downloaded.
              </div>
            )}

            {exportError && (
              <div className="p-3 border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs font-mono">
                {exportError}
              </div>
            )}
          </div>
        </section>

        {/* Section 03: Account Deletion (Red Zone) */}
        <section className="border border-red-950/80 bg-red-950/10 p-6 space-y-6">
          <div className="border-b border-red-950/80 pb-4">
            <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">03 // DANGER ZONE</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Purge Account &amp; Matters</h2>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed">
            Permanently deletes your account, stored legal matters, documents metadata, generated drafts, and timelines.
            This action is irreversible. Statutory audit logs verifying account erasure are retained per IT Act requirements.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 border border-rose-700 bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-xs font-mono uppercase tracking-wider"
            >
              Initiate Account Deletion
            </button>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-stone-800 bg-stone-950 p-6 space-y-6 shadow-2xl">
            <div className="space-y-2 border-b border-stone-800 pb-4">
              <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-widest">IRREVERSIBLE ACTION</span>
              <h3 className="text-lg font-bold uppercase text-white">Confirm Account Erasure</h3>
              <p className="text-xs text-stone-400">
                To proceed, type your active account email (<span className="text-white font-mono">{user.email}</span>) below:
              </p>
            </div>

            <div className="space-y-2">
              <input
                id="confirmEmail"
                name="confirmEmail"
                type="email"
                aria-label="Confirm Account Email"
                value={confirmEmail}
                onChange={e => setConfirmEmail(e.target.value)}
                placeholder={user.email}
                className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
              {deleteError && (
                <p className="text-xs text-rose-400 font-mono">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmEmail('');
                  setDeleteError('');
                }}
                className="px-4 py-2 border border-stone-800 text-xs font-mono uppercase text-stone-300 hover:bg-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !confirmEmail}
                className="px-4 py-2 border border-rose-700 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase font-bold disabled:opacity-50"
              >
                {deleting ? 'Purging...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
