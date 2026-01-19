import { TeamData } from '@/lib/types';

interface RiskBadgeProps {
  riskCategory: TeamData['Risk_Category'];
  riskScore: number;
}

export default function RiskBadge({ riskCategory, riskScore }: RiskBadgeProps) {
  const styles = {
    Critical: {
      bg: 'bg-linear-to-br from-red-50 to-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500'
    },
    High: {
      bg: 'bg-linear-to-br from-orange-50 to-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
      dot: 'bg-orange-500'
    },
    Moderate: {
      bg: 'bg-linear-to-br from-yellow-50 to-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      dot: 'bg-yellow-500'
    },
    Low: {
      bg: 'bg-linear-to-br from-green-50 to-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      dot: 'bg-green-500'
    },
  };

  const style = styles[riskCategory];

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${style.bg} ${style.border}`}>
      <div className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></div>
      <div className="flex items-baseline gap-2">
        <span className={`text-sm font-semibold ${style.text} tracking-tight`}>
          {riskCategory} Risk
        </span>
        <span className={`text-xs font-bold ${style.text} opacity-75`}>
          {Math.round(riskScore)}
        </span>
      </div>
    </div>
  );
}
