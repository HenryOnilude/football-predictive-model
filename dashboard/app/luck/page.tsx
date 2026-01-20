import { fetchLuckData } from '@/app/actions/fetchLuckData';
import DeltaDeckClient from './DeltaDeckClient';

export const dynamic = 'force-dynamic';

export default async function DeltaDeckPage() {
  const data = await fetchLuckData();

  return (
    <DeltaDeckClient 
      players={data.players}
      gameweek={data.gameweek}
      lastUpdated={data.lastUpdated}
      cached={data.cached}
    />
  );
}
