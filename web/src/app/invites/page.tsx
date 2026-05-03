"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TaskApi } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle, LayoutGrid } from "lucide-react";

function AcceptInviteClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  
  // Restore token from sessionStorage if the OAuth redirect stripped the query param
  const token = searchParams.get('token') 
    || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null)
    || (typeof window !== 'undefined' ? sessionStorage.getItem('pendingInviteToken') : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasAutoAccepted = useRef(false);

  const getApi = useCallback(() => new TaskApi(() => user?.getIdToken() || Promise.resolve(undefined)), [user]);

  // Persist token to sessionStorage so it survives OAuth redirects (especially on mobile)
  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      sessionStorage.setItem('pendingInviteToken', token);
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) {
      setError("No invitation token provided.");
      return;
    }

    if (!user) {
      loginWithGoogle();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await getApi().acceptInvitation(token);
      // Clean up sessionStorage on success
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingInviteToken');
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch {
      setError("This invitation is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-accept after OAuth sign-in completes (no second click required)
  useEffect(() => {
    if (user && token && !authLoading && !success && !hasAutoAccepted.current) {
      hasAutoAccepted.current = true;
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, authLoading]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-8 animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
        <LayoutGrid size={40} className="text-white" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">You&apos;re Invited!</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          A colleague has invited you to join their workspace on TaskManager.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 flex items-center gap-3 text-sm text-left">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <CheckCircle2 size={48} className="text-green-500 animate-in zoom-in duration-300" />
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">Welcome aboard!</p>
          <p className="text-sm text-zinc-500">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {!user && (
            <p className="text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
              Please sign in to accept this invitation.
            </p>
          )}
          
          <button
            onClick={handleAccept}
            disabled={loading || authLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {(loading || authLoading) ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              user ? 'Accept Invitation & Join' : 'Sign in to Join'
            )}
          </button>
          
          {user && (
            <p className="text-xs text-zinc-400 italic">
              Accepting as <span className="font-semibold">{user.email}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
      <Suspense fallback={<div className="flex justify-center items-center"><Loader2 size={48} className="animate-spin text-indigo-600" /></div>}>
        <AcceptInviteClient />
      </Suspense>
    </div>
  );
}
