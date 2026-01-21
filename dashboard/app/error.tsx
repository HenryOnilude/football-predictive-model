'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Error Card */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-white mb-3">
            System Malfunction
          </h1>
          <p className="text-slate-400 mb-2">
            The data connection has been interrupted.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            This may be due to API rate limits or network issues.
          </p>

          {/* Error Details (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800 text-left">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Error Details
              </p>
              <p className="text-sm text-rose-400 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-600 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          FPL Axiom - Establish the Truth
        </p>
      </div>
    </div>
  );
}
