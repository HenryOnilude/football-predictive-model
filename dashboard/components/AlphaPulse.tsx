'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Smartphone, WifiOff } from 'lucide-react';
import type { FPLAlphaStatus } from '@/lib/fpl';

/**
 * AlphaPulse - API Health Indicator
 * Shows real-time FPL API connection status:
 * - Green: Server proxy working
 * - Amber: Client fallback active  
 * - Red: Disconnected
 */
export default function AlphaPulse() {
  const [status, setStatus] = useState<FPLAlphaStatus>({
    mode: 'DISCONNECTED',
    lastFetch: 0,
    latency: 0,
  });
  const [expanded, setExpanded] = useState(false);

  // Sync with window status on mount and listen for changes
  useEffect(() => {
    // Listen for status changes from fetchFPLData
    const handleStatusChange = (event: CustomEvent<FPLAlphaStatus>) => {
      setStatus(event.detail);
    };

    window.addEventListener('fpl-status-change', handleStatusChange as EventListener);

    return () => {
      window.removeEventListener('fpl-status-change', handleStatusChange as EventListener);
    };
  }, []);

  // Poll healthz endpoint periodically (separate effect)
  useEffect(() => {
    const pollHealth = async () => {
      try {
        const res = await fetch('/api/healthz');
        const data = await res.json();
        // Only update if we don't have status from fetchFPLData
        if (data.fpl?.status) {
          setStatus(prev => {
            // Don't override if we already have real status
            if (prev.lastFetch > 0) return prev;
            return {
              ...prev,
              mode: data.fpl.status === 'ok' ? 'SERVER' : 'DISCONNECTED',
              latency: data.fpl.latency || prev.latency,
            };
          });
        }
      } catch {
        // Silently fail - status will update on next data fetch
      }
    };

    // Initial poll after short delay
    const initialPoll = setTimeout(pollHealth, 1000);
    const interval = setInterval(pollHealth, 30000);

    return () => {
      clearTimeout(initialPoll);
      clearInterval(interval);
    };
  }, []);

  const getStatusConfig = () => {
    switch (status.mode) {
      case 'SERVER':
        return {
          color: 'bg-emerald-500',
          pulseColor: 'bg-emerald-400',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgColor: 'bg-emerald-500/10',
          icon: Server,
          label: 'Server',
          description: 'Proxy connection active',
        };
      case 'CLIENT_FALLBACK':
        return {
          color: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/10',
          icon: Smartphone,
          label: 'Fallback',
          description: 'Direct browser fetch active',
        };
      case 'DISCONNECTED':
      default:
        return {
          color: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          bgColor: 'bg-rose-500/10',
          icon: WifiOff,
          label: 'Offline',
          description: 'Connection failed',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  // Track time since last fetch with state to avoid impure render
  const [timeSince, setTimeSince] = useState<number | null>(null);
  
  useEffect(() => {
    const updateTimeSince = () => {
      if (status.lastFetch) {
        setTimeSince(Math.round((Date.now() - status.lastFetch) / 1000));
      }
    };
    updateTimeSince();
    const timer = setInterval(updateTimeSince, 1000);
    return () => clearInterval(timer);
  }, [status.lastFetch]);

  return (
    <div className="relative">
      {/* Compact indicator */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-2 py-1 rounded-lg ${config.bgColor} ${config.borderColor} border transition-all hover:opacity-80`}
        title={`API Status: ${config.label}`}
      >
        {/* Pulse indicator */}
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
        </span>
        
        <span className={`text-xs font-medium ${config.textColor} hidden sm:inline`}>
          {config.label}
        </span>
        
        {status.latency > 0 && (
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            {status.latency}ms
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className={`absolute top-full right-0 mt-2 w-64 p-3 rounded-xl ${config.bgColor} ${config.borderColor} border shadow-xl z-50`}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`w-4 h-4 ${config.textColor}`} />
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {config.label} Mode
            </span>
          </div>
          
          <p className="text-xs text-slate-400 mb-3">
            {config.description}
          </p>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Latency</span>
              <span className="text-slate-300 font-mono">
                {status.latency > 0 ? `${status.latency}ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Fetch</span>
              <span className="text-slate-300 font-mono">
                {timeSince !== null ? `${timeSince}s ago` : '—'}
              </span>
            </div>
            {status.error && (
              <div className="mt-2 p-2 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                {status.error}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Activity className="w-3 h-3" />
              <span>FPL Alpha Health Monitor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
