'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hexagon, Zap, Briefcase, ScatterChart } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fpl', label: 'Terminal', icon: Hexagon },
  { href: '/luck', label: 'Alpha', icon: Zap },
  { href: '/teams', label: 'Assets', icon: Briefcase },
  { href: '/matrix', label: 'Matrix', icon: ScatterChart },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] pb-[env(safe-area-inset-bottom)]"
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 transition-all group"
            >
              {/* Active indicator - top glow line */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{
                    background: '#06b6d4',
                    boxShadow: '0 0 8px rgba(6, 182, 212, 0.6)',
                  }}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-400 group-hover:text-slate-200 group-active:text-slate-300'
                }`}
                style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))' } : {}}
              />
              <span
                className={`text-[10px] font-medium mt-1 truncate transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
