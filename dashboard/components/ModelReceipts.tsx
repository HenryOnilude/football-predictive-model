'use client';

import { Trophy, XCircle, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface PredictionResult {
  playerId: number;
  playerName: string;
  team: string;
  predictedSignal: 'BUY' | 'SELL' | 'HOLD';
  predictedLuck: number;
  actualPoints: number;
  wasCorrect: boolean;
}

interface ModelReceiptsProps {
  gameweek: number;
  predictions: PredictionResult[];
  modelAccuracy?: number; // Override calculated accuracy
}

function calculateAccuracy(predictions: PredictionResult[]): number {
  if (predictions.length === 0) return 0;
  const correct = predictions.filter(p => p.wasCorrect).length;
  return Math.round((correct / predictions.length) * 100);
}

function findBiggestWin(predictions: PredictionResult[]): PredictionResult | null {
  // Biggest Win: We said BUY, and they got the most points
  const buyPredictions = predictions.filter(
    p => p.predictedSignal === 'BUY' && p.wasCorrect && p.actualPoints > 0
  );
  
  if (buyPredictions.length === 0) return null;
  
  return buyPredictions.reduce((best, current) => 
    current.actualPoints > best.actualPoints ? current : best
  );
}

function findBiggestMiss(predictions: PredictionResult[]): PredictionResult | null {
  // Biggest Miss: We said BUY, but they blanked (0-2 points)
  const missedPredictions = predictions.filter(
    p => p.predictedSignal === 'BUY' && !p.wasCorrect && p.actualPoints <= 2
  );
  
  if (missedPredictions.length === 0) return null;
  
  // Return the one with highest predicted luck (we were most confident)
  return missedPredictions.reduce((worst, current) => 
    current.predictedLuck > worst.predictedLuck ? current : worst
  );
}

export default function ModelReceipts({
  gameweek,
  predictions,
  modelAccuracy,
}: ModelReceiptsProps) {
  const accuracy = modelAccuracy ?? calculateAccuracy(predictions);
  const biggestWin = findBiggestWin(predictions);
  const biggestMiss = findBiggestMiss(predictions);
  
  // Accuracy color coding
  const accuracyColor = accuracy >= 70 
    ? 'text-emerald-400' 
    : accuracy >= 50 
    ? 'text-amber-400' 
    : 'text-rose-400';

  const accuracyBg = accuracy >= 70
    ? 'from-emerald-500/20 to-emerald-500/5'
    : accuracy >= 50
    ? 'from-amber-500/20 to-amber-500/5'
    : 'from-rose-500/20 to-rose-500/5';

  return (
    <div className="w-full max-w-lg">
      {/* Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/50 pointer-events-none" />
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">Model Receipts</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">GW{gameweek}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            How our predictions performed last week
          </p>
        </div>

        {/* Accuracy Section */}
        <div className={`relative px-6 py-6 bg-gradient-to-r ${accuracyBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">
                Model Accuracy
              </p>
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-bold font-mono ${accuracyColor}`}>
                  {accuracy}
                </span>
                <span className={`text-2xl font-bold ${accuracyColor}`}>%</span>
              </div>
            </div>
            
            {/* Accuracy Ring */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-800"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${accuracy * 1.76} 176`}
                  strokeLinecap="round"
                  className={accuracyColor}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className={`w-6 h-6 ${accuracyColor}`} />
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 mt-3">
            {predictions.filter(p => p.wasCorrect).length} of {predictions.length} predictions correct
          </p>
        </div>

        {/* Biggest Win */}
        <div className="relative px-6 py-4 border-t border-white/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Biggest Win
              </p>
              {biggestWin ? (
                <div className="mt-1">
                  <p className="text-white font-semibold">{biggestWin.playerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{biggestWin.team}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-emerald-400 font-mono">
                      {biggestWin.actualPoints} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    We said BUY, He Hauled
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1">No standout wins this week</p>
              )}
            </div>
          </div>
        </div>

        {/* Biggest Miss */}
        <div className="relative px-6 py-4 border-t border-white/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Biggest Miss
              </p>
              {biggestMiss ? (
                <div className="mt-1">
                  <p className="text-white font-semibold">{biggestMiss.playerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{biggestMiss.team}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-rose-400 font-mono">
                      {biggestMiss.actualPoints} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                    We said BUY, He Blanked
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1">No major misses this week</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-3 border-t border-white/10 bg-slate-900/50">
          <p className="text-[10px] text-slate-600 text-center">
            Predictions based on xG variance analysis • Updated weekly
          </p>
        </div>
      </div>
    </div>
  );
}

// Demo data for testing
export const demoPredictions: PredictionResult[] = [
  { playerId: 1, playerName: 'E. Haaland', team: 'Man City', predictedSignal: 'BUY', predictedLuck: 2.5, actualPoints: 15, wasCorrect: true },
  { playerId: 2, playerName: 'M. Salah', team: 'Liverpool', predictedSignal: 'BUY', predictedLuck: 1.8, actualPoints: 12, wasCorrect: true },
  { playerId: 3, playerName: 'C. Palmer', team: 'Chelsea', predictedSignal: 'BUY', predictedLuck: 2.1, actualPoints: 2, wasCorrect: false },
  { playerId: 4, playerName: 'A. Isak', team: 'Newcastle', predictedSignal: 'SELL', predictedLuck: -1.5, actualPoints: 2, wasCorrect: true },
  { playerId: 5, playerName: 'B. Saka', team: 'Arsenal', predictedSignal: 'BUY', predictedLuck: 1.2, actualPoints: 8, wasCorrect: true },
  { playerId: 6, playerName: 'O. Watkins', team: 'Aston Villa', predictedSignal: 'HOLD', predictedLuck: 0.3, actualPoints: 5, wasCorrect: true },
  { playerId: 7, playerName: 'D. Núñez', team: 'Liverpool', predictedSignal: 'BUY', predictedLuck: 1.9, actualPoints: 1, wasCorrect: false },
  { playerId: 8, playerName: 'J. Solanke', team: 'Spurs', predictedSignal: 'SELL', predictedLuck: -0.8, actualPoints: 6, wasCorrect: false },
  { playerId: 9, playerName: 'N. Jackson', team: 'Chelsea', predictedSignal: 'BUY', predictedLuck: 1.4, actualPoints: 9, wasCorrect: true },
];
