'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Manual overrides for known players with ID drifts or mismatches
 * Format: { 'Player Name': 'p{playerId}' }
 */
const IMAGE_FIXES: Record<string, string> = {
  'Cole Palmer': 'p492774',
  'C. Palmer': 'p492774',
  'Erling Haaland': 'p223094',
  'E. Haaland': 'p223094',
  'Mohamed Salah': 'p118748',
  'M. Salah': 'p118748',
  'Bukayo Saka': 'p448334',
  'B. Saka': 'p448334',
  'Phil Foden': 'p430725',
  'P. Foden': 'p430725',
  'Marcus Rashford': 'p455617',
  'M. Rashford': 'p455617',
  'Darwin Nunez': 'p482605',
  'Darwin Núñez': 'p482605',
  'D. Núñez': 'p482605',
  'D. Nunez': 'p482605',
  'Alexander Isak': 'p467169',
  'A. Isak': 'p467169',
  'Ollie Watkins': 'p447072',
  'O. Watkins': 'p447072',
  'Son Heung-min': 'p85971',
  'H. Son': 'p85971',
  'Bruno Fernandes': 'p141746',
  'B. Fernandes': 'p141746',
  'Kevin De Bruyne': 'p61366',
  'K. De Bruyne': 'p61366',
  'Jarrod Bowen': 'p447015',
  'J. Bowen': 'p447015',
  'Nicolas Jackson': 'p515747',
  'N. Jackson': 'p515747',
  'Dominic Solanke': 'p447201',
  'D. Solanke': 'p447201',
  'J. Solanke': 'p447201',
  'Anthony Gordon': 'p493105',
  'A. Gordon': 'p493105',
  'Eberechi Eze': 'p446974',
  'E. Eze': 'p446974',
  'Douglas Luiz': 'p454959',
  'D. Luiz': 'p454959',
  'Heung-Min Son': 'p85971',
  'Richarlison': 'p154566',
  'Kai Havertz': 'p449966',
  'K. Havertz': 'p449966',
  'Gabriel Jesus': 'p238794',
  'G. Jesus': 'p238794',
  'Brennan Johnson': 'p464427',
  'B. Johnson': 'p464427',
  'Chris Wood': 'p41792',
  'C. Wood': 'p41792',
  'Jean-Philippe Mateta': 'p203261',
  'J. Mateta': 'p203261',
  'Yoane Wissa': 'p243016',
  'Y. Wissa': 'p243016',
  'Matheus Cunha': 'p324649',
  'M. Cunha': 'p324649',
};

/**
 * Team logo URLs for fallback
 */
const TEAM_LOGOS: Record<string, string> = {
  'Arsenal': 'https://resources.premierleague.com/premierleague/badges/t3.png',
  'Aston Villa': 'https://resources.premierleague.com/premierleague/badges/t7.png',
  'Bournemouth': 'https://resources.premierleague.com/premierleague/badges/t91.png',
  'Brentford': 'https://resources.premierleague.com/premierleague/badges/t94.png',
  'Brighton': 'https://resources.premierleague.com/premierleague/badges/t36.png',
  'Chelsea': 'https://resources.premierleague.com/premierleague/badges/t8.png',
  'Crystal Palace': 'https://resources.premierleague.com/premierleague/badges/t31.png',
  'Everton': 'https://resources.premierleague.com/premierleague/badges/t11.png',
  'Fulham': 'https://resources.premierleague.com/premierleague/badges/t54.png',
  'Ipswich': 'https://resources.premierleague.com/premierleague/badges/t40.png',
  'Ipswich Town': 'https://resources.premierleague.com/premierleague/badges/t40.png',
  'Leicester': 'https://resources.premierleague.com/premierleague/badges/t13.png',
  'Leicester City': 'https://resources.premierleague.com/premierleague/badges/t13.png',
  'Liverpool': 'https://resources.premierleague.com/premierleague/badges/t14.png',
  'Manchester City': 'https://resources.premierleague.com/premierleague/badges/t43.png',
  'Man City': 'https://resources.premierleague.com/premierleague/badges/t43.png',
  'Manchester United': 'https://resources.premierleague.com/premierleague/badges/t1.png',
  'Man United': 'https://resources.premierleague.com/premierleague/badges/t1.png',
  'Newcastle': 'https://resources.premierleague.com/premierleague/badges/t4.png',
  'Newcastle United': 'https://resources.premierleague.com/premierleague/badges/t4.png',
  'Nottingham Forest': 'https://resources.premierleague.com/premierleague/badges/t17.png',
  "Nott'm Forest": 'https://resources.premierleague.com/premierleague/badges/t17.png',
  'Southampton': 'https://resources.premierleague.com/premierleague/badges/t20.png',
  'Tottenham': 'https://resources.premierleague.com/premierleague/badges/t6.png',
  'Tottenham Hotspur': 'https://resources.premierleague.com/premierleague/badges/t6.png',
  'Spurs': 'https://resources.premierleague.com/premierleague/badges/t6.png',
  'West Ham': 'https://resources.premierleague.com/premierleague/badges/t21.png',
  'West Ham United': 'https://resources.premierleague.com/premierleague/badges/t21.png',
  'Wolves': 'https://resources.premierleague.com/premierleague/badges/t39.png',
  'Wolverhampton': 'https://resources.premierleague.com/premierleague/badges/t39.png',
};

interface PlayerImageProps {
  playerId?: number | string;
  playerName?: string;
  teamName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Get the correct player image URL
 * Priority: ManualOverrides > PlayerId > Fallback
 */
function getPlayerImageUrl(playerId?: number | string, playerName?: string): string {
  // 1. Check manual overrides first (for known problematic players)
  if (playerName && IMAGE_FIXES[playerName]) {
    const fixedId = IMAGE_FIXES[playerName];
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/${fixedId}.png`;
  }

  // 2. Use player ID if provided
  if (playerId) {
    const id = typeof playerId === 'string' ? playerId : `p${playerId}`;
    const formattedId = id.startsWith('p') ? id : `p${id}`;
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/${formattedId}.png`;
  }

  // 3. Return empty string to trigger fallback
  return '';
}

/**
 * Get team logo URL for fallback
 */
function getTeamLogoUrl(teamName?: string): string | null {
  if (!teamName) return null;
  return TEAM_LOGOS[teamName] || null;
}

const sizeClasses = {
  sm: 'w-10 h-12',
  md: 'w-16 h-20',
  lg: 'w-24 h-28',
};

const sizeDimensions = {
  sm: { width: 40, height: 48 },
  md: { width: 64, height: 80 },
  lg: { width: 96, height: 112 },
};

export default function PlayerImage({
  playerId,
  playerName,
  teamName,
  size = 'md',
  className = '',
}: PlayerImageProps) {
  const [imageError, setImageError] = useState(false);
  const [teamLogoError, setTeamLogoError] = useState(false);

  const imageUrl = getPlayerImageUrl(playerId, playerName);
  const teamLogoUrl = getTeamLogoUrl(teamName);
  const dimensions = sizeDimensions[size];

  // Handle image load error - switch to fallback
  const handleImageError = () => {
    setImageError(true);
  };

  const handleTeamLogoError = () => {
    setTeamLogoError(true);
  };

  // Fallback 1: Team Logo
  if (imageError && teamLogoUrl && !teamLogoError) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden ${className}`}>
        <Image
          src={teamLogoUrl}
          alt={teamName || 'Team'}
          width={dimensions.width - 8}
          height={dimensions.width - 8}
          className="object-contain"
          onError={handleTeamLogoError}
        />
      </div>
    );
  }

  // Fallback 2: Jersey Icon (if no team logo or team logo failed)
  if (imageError || !imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center ${className}`}>
        <svg 
          className="w-1/2 h-1/2 text-slate-500" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 6.5L17.5 3H6.5L3 6.5V9h3v11h12V9h3V6.5zM16 18H8v-9h8v9zm3-11h-1V5.5L16.5 4h-9L6 5.5V7H5V6.5L6.5 5h11L19 6.5V7z"/>
          <path d="M12 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
    );
  }

  // Primary: Player photo
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-slate-800 overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={playerName || 'Player'}
        width={dimensions.width}
        height={dimensions.height}
        className="object-cover object-top w-full h-full"
        onError={handleImageError}
        unoptimized
      />
    </div>
  );
}

/**
 * Utility function to get player image URL (for use in other components)
 */
export function getPlayerImage(playerId?: number | string, playerName?: string): string {
  return getPlayerImageUrl(playerId, playerName);
}

/**
 * Export the fixes map for external use
 */
export { IMAGE_FIXES, TEAM_LOGOS };
