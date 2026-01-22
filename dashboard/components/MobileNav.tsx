'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/fpl', label: 'Terminal', icon: '💹' },
  { href: '/luck', label: 'Alpha', icon: 'Δ' },
  { href: '/teams', label: 'Teams', icon: '⚽' },
  { href: '/matrix', label: 'Matrix', icon: '📈' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-md border-t border-slate-700/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-lg transition-all ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 active:bg-slate-800'
              }`}
            >
              <span className={`text-lg ${item.icon === 'Δ' ? 'font-bold' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium mt-0.5 truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
