'use client';

import Link from 'next/link';

const quickLinks = [
  {
    href: '/matrix',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Regression Matrix',
    description: 'Health vs Heat analysis for all teams',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
  },
  {
    href: '/teams',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Full Team Reports',
    description: 'Detailed analysis for every Premier League team',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    href: '/luck',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Player Luck Cards',
    description: 'Find undervalued players due a haul',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
  },
];

export default function DeepDiveLinks() {
  return (
    <div className="mt-12 pt-8 border-t border-[var(--border-subtle-color)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary-color)] mb-4">
        Deep Dive Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`group p-4 rounded-xl ${link.bgColor} border ${link.borderColor} ${link.hoverBorder} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${link.bgColor} ${link.color}`}>
                {link.icon}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${link.color} group-hover:brightness-110 transition-all flex items-center gap-2`}>
                  {link.title}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </h4>
                <p className="text-xs text-[var(--text-muted-color)] mt-1">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
