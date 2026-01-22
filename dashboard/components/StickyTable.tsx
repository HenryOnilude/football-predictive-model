'use client';

import { ReactNode, useState } from 'react';

interface StickyTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * BBC Sport-style Sticky Table Container
 * - Prevents horizontal page shaking with overflow-x: auto
 * - Uses width: max-content to prevent column squeezing
 * - Adds visual cue (gradient shadow) for horizontal scroll
 */
export function StickyTableContainer({ children, className = '' }: StickyTableProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Scroll shadow indicator on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10 md:hidden" />
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {children}
      </div>
    </div>
  );
}

interface StickyColumnProps {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
}

/**
 * Pinned column cell for team/player names
 * - position: sticky with left: 0
 * - Box shadow on right edge to signal more data
 */
export function StickyColumn({ children, className = '', isHeader = false }: StickyColumnProps) {
  const baseClasses = 'sticky left-0 z-20 bg-slate-900 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-slate-700/50';
  const shadowClasses = 'after:shadow-[2px_0_8px_rgba(0,0,0,0.3)]';
  
  return isHeader ? (
    <th className={`${baseClasses} ${shadowClasses} ${className}`}>
      {children}
    </th>
  ) : (
    <td className={`${baseClasses} ${shadowClasses} ${className}`}>
      {children}
    </td>
  );
}

interface ExpandableRowProps {
  children: ReactNode;
  expandedContent: ReactNode;
  className?: string;
}

/**
 * Sky Sports-style expandable row for progressive disclosure
 * - Tap to reveal detailed "Nuclear Math" data on mobile
 */
export function ExpandableRow({ children, expandedContent, className = '' }: ExpandableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr 
        className={`cursor-pointer md:cursor-default hover:bg-slate-800/50 transition-colors ${className}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {children}
        {/* Expand indicator - mobile only */}
        <td className="md:hidden px-2 py-3 text-slate-500">
          <span className={`inline-block transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </td>
      </tr>
      {/* Expanded content - mobile only */}
      {isExpanded && (
        <tr className="md:hidden bg-slate-800/30 border-b border-slate-700/50">
          <td colSpan={100} className="px-4 py-3">
            {expandedContent}
          </td>
        </tr>
      )}
    </>
  );
}

interface StatusBadgeProps {
  status: 'critical' | 'high' | 'moderate' | 'low' | 'elite';
  label?: string;
  compact?: boolean;
}

/**
 * Color-coded status badge for mobile space efficiency
 * Replaces long text strings like "High Risk"
 */
export function StatusBadge({ status, label, compact = false }: StatusBadgeProps) {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    elite: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const dots = {
    critical: '🔴',
    high: '🟠',
    moderate: '🟡',
    low: '🟢',
    elite: '🔵',
  };

  if (compact) {
    return (
      <span className="text-sm" title={label || status}>
        {dots[status]}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/**
 * Financial typography utility for right-aligned numbers
 */
export function NumericCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`text-right tabular-nums font-mono text-xs md:text-sm ${className}`}>
      {children}
    </td>
  );
}

/**
 * Table wrapper with max-content width to prevent column squeezing
 */
export function DataTable({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <table className={`w-max min-w-full border-collapse ${className}`}>
      {children}
    </table>
  );
}
