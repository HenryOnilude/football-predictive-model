import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <FileQuestion className="w-12 h-12 text-slate-600" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <span className="text-7xl font-bold text-slate-800">404</span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Scout Report Missing
        </h1>
        <p className="text-slate-400 mb-8">
          This player or team does not exist in our database.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/teams"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Teams
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-slate-600">
          FPL Axiom - Establish the Truth
        </p>
      </div>
    </div>
  );
}
