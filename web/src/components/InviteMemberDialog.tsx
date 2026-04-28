"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { WorkspaceRole } from '../../../shared/workspace';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: WorkspaceRole) => Promise<string | void>;
  workspaceName: string;
}

export function InviteMemberDialog({ isOpen, onClose, onInvite, workspaceName }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isOpen) {
      // Clear state after animation completes
      timer = setTimeout(() => {
        setInvitationToken(null);
        setEmail('');
        setCopied(false);
        setError(null);
      }, 300);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      const token = await onInvite(email, role);
      if (token && typeof token === 'string') {
        setInvitationToken(token);
        return;
      }
      setEmail('');
      onClose();
    } catch {
      setError("Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = invitationToken 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invites?token=${invitationToken}`
    : '';

  const copyToClipboard = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        data-testid="invite-member-dialog"
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {invitationToken ? 'Invitation Created' : 'Invite Team Member'}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {invitationToken ? 'Share this link with your colleague' : `Invite others to ${workspaceName}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {invitationToken ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Share Link</span>
                  {copied && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in zoom-in">
                      <Check size={12} /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 truncate font-mono">
                    {inviteUrl}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Done
                </button>
                <a 
                  href={inviteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 text-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  Preview Link
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Mail size={14} />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  data-testid="invite-email-input"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Shield size={14} />
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['viewer', 'editor', 'owner'] as WorkspaceRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      data-testid={`role-button-${r}`}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                        role === r 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="send-invitation-button"
                  disabled={loading || !email}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Invitation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
