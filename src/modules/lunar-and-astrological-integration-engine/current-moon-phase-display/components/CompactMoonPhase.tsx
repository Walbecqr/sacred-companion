'use client';

import { useEffect, useState, useCallback } from 'react';
import { Moon } from 'lucide-react';
import { moonPhaseService } from '@/modules/lunar-and-astrological-integration-engine/real-time-celestial-data/db/moon-phase-api';
import type { MoonPhaseDisplayData } from '@/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/types';

interface CompactMoonPhaseProps {
  className?: string;
}

export default function CompactMoonPhase({ className = '' }: CompactMoonPhaseProps) {
  const [moonData, setMoonData] = useState<MoonPhaseDisplayData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMoonData = useCallback(async () => {
    try {
      const data = await moonPhaseService.fetchMoonPhaseData();
      
      if ('error' in data) {
        setMoonData(null);
      } else {
        setMoonData(data);
      }
    } catch (err) {
      setMoonData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoonData();
    
    // Update every hour
    const interval = setInterval(fetchMoonData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMoonData]);

  const getMoonPhaseIcon = (phaseName: string) => {
    const iconMap: Record<string, string> = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘'
    };
    return iconMap[phaseName] || '🌙';
  };

  if (loading || !moonData) {
    return (
      <div className={`flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full ${className}`}>
        <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Loading...</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full ${className}`}
      title={`${moonData.moon.phase_name} - ${moonData.moon.illumination} illuminated`}
    >
      <span className="text-sm" aria-label={moonData.moon.phase_name}>
        {getMoonPhaseIcon(moonData.moon.phase_name)}
      </span>
      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
        {moonData.moon.phase_name}
      </span>
      <span className="text-xs text-purple-600 dark:text-purple-400">
        {moonData.moon.illumination}
      </span>
    </div>
  );
}
