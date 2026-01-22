'use client';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton pulse animation
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
  );
}

/**
 * Skeleton for player/team cards
 */
export function CardSkeleton() {
  return (
    <div className="w-full max-w-[280px] p-4 rounded-xl bg-slate-900/50 border border-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-20 w-full mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-800/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Full table skeleton
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Loading state with message
 */
export function LoadingState({ message = 'Scanning Premier League Alpha Signals...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-emerald-400">Δ</span>
        </div>
      </div>
      <p className="text-sm text-slate-400 text-center animate-pulse">{message}</p>
    </div>
  );
}

/**
 * Empty state with informative message
 */
export function EmptyState({ 
  title = 'No Data Available',
  message = 'Data is being processed. Check back shortly.',
  icon = '📊'
}: { 
  title?: string;
  message?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs">{message}</p>
    </div>
  );
}

/**
 * Numeric value with skeleton fallback
 */
export function NumericValue({ 
  value, 
  isLoading = false,
  className = '' 
}: { 
  value: number | string | null | undefined;
  isLoading?: boolean;
  className?: string;
}) {
  if (isLoading || value === null || value === undefined) {
    return <Skeleton className={`h-6 w-12 inline-block ${className}`} />;
  }
  
  // Show skeleton for zero values that might indicate loading
  if (value === 0 || value === '0') {
    return <span className={`text-slate-500 ${className}`}>—</span>;
  }
  
  return <span className={className}>{value}</span>;
}

const SkeletonComponents = {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  LoadingState,
  EmptyState,
  NumericValue,
};

export default SkeletonComponents;
