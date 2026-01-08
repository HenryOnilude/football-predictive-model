import { TeamData } from '@/lib/types';

interface RiskBadgeProps {
  riskCategory: TeamData['Risk_Category'];
  riskScore: number;
}

export default function RiskBadge({ riskCategory, riskScore }: RiskBadgeProps) {
  const colors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
  };

  const icons = {
    Critical: '🔴',
    High: '🟠',
    Moderate: '🟡',
    Low: '🟢',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[riskCategory]}`}>
      <span>{icons[riskCategory]}</span>
      <span>{riskCategory}</span>
      <span className="font-bold">({riskScore})</span>
    </span>
  );
}
