'use client';

import { useEffect, useState, useCallback } from 'react';
import { Moon, Sparkles, Calendar, Clock, Droplets, Gem, Leaf, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { moonPhaseService } from '@/modules/lunar-and-astrological-integration-engine/real-time-celestial-data/db/moon-phase-api';
import type { MoonPhaseDisplayData, MoonPhaseError } from '@/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/types';

interface MoonPhaseDisplayProps {
  className?: string;
  compact?: boolean;
  showSpiritual?: boolean;
  autoUpdate?: boolean;
  updateInterval?: number; // in minutes
}

export default function MoonPhaseDisplay({ 
  className = '', 
  compact = false,
  showSpiritual = true,
  autoUpdate = true,
  updateInterval = 60 
}: MoonPhaseDisplayProps) {
  const [moonData, setMoonData] = useState<MoonPhaseDisplayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextPhase, setNextPhase] = useState<{ phase: string; timeUntil: string; timestamp: number } | null>(null);
  const [spiritualVisible, setSpiritualVisible] = useState(showSpiritual);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMoonData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      const data = await moonPhaseService.fetchMoonPhaseData(forceRefresh);
      
      if ('error' in data) {
        setError(data.error);
        setMoonData(null);
      } else {
        setMoonData(data);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch moon phase data');
      setMoonData(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchNextPhase = useCallback(async () => {
    try {
      const next = await moonPhaseService.getTimeToNextPhase();
      setNextPhase(next);
    } catch (err) {
      console.warn('Failed to fetch next phase data:', err);
    }
  }, []);

  useEffect(() => {
    fetchMoonData();
    fetchNextPhase();
  }, [fetchMoonData, fetchNextPhase]);

  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      fetchMoonData();
      fetchNextPhase();
    }, updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, fetchMoonData, fetchNextPhase]);

  const handleRefresh = () => {
    fetchMoonData(true);
    fetchNextPhase();
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

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

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Moon className="w-6 h-6 text-purple-600 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lunar Energies</h3>
        </div>
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow border-l-4 border-red-400 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lunar Data Unavailable</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Retry connection"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last cached data may still be available. Try refreshing or check your connection.
        </p>
      </div>
    );
  }

  if (!moonData) {
    return null;
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-label={moonData.moon.phase_name}>
              {getMoonPhaseIcon(moonData.moon.phase_name)}
            </span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{moonData.moon.phase_name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{moonData.moon.illumination} illuminated</p>
            </div>
          </div>
          {nextPhase && (
            <div className="text-right">
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Next: {nextPhase.phase}</p>
              <p className="text-xs text-gray-500">{nextPhase.timeUntil}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 shadow-lg border border-purple-200 dark:border-purple-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lunar Energies</h3>
        </div>
        <div className="flex items-center gap-2">
          {showSpiritual && (
            <button
              onClick={() => setSpiritualVisible(!spiritualVisible)}
              className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              title={spiritualVisible ? 'Hide spiritual guidance' : 'Show spiritual guidance'}
            >
              {spiritualVisible ? (
                <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              )}
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
            title="Refresh lunar data"
          >
            <RefreshCw className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Moon Phase */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl" aria-label={moonData.moon.phase_name}>
            {getMoonPhaseIcon(moonData.moon.phase_name)}
          </span>
          <div className="flex-1">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {moonData.moon.phase_name}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Illumination:</span>
                <span className="ml-2 font-medium text-purple-700 dark:text-purple-300">
                  {moonData.moon.illumination}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Age:</span>
                <span className="ml-2 font-medium text-purple-700 dark:text-purple-300">
                  {moonData.moon.age_days} days
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Stage:</span>
                <span className="ml-2 font-medium text-purple-700 dark:text-purple-300 capitalize">
                  {moonData.moon.stage}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Zodiac:</span>
                <span className="ml-2 font-medium text-purple-700 dark:text-purple-300">
                  {moonData.moon.zodiac.moon_sign}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Phase Timing */}
        {nextPhase && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">Next Phase</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{nextPhase.phase}</span> in <span className="font-medium text-purple-700 dark:text-purple-300">{nextPhase.timeUntil}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(nextPhase.timestamp * 1000).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Spiritual Significance */}
      {showSpiritual && spiritualVisible && moonData.spiritual_significance && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h5 className="font-semibold text-gray-900 dark:text-white">Spiritual Significance</h5>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 space-y-4">
            <div>
              <h6 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Energy</h6>
              <p className="text-sm text-gray-700 dark:text-gray-300">{moonData.spiritual_significance.energy}</p>
            </div>

            <div>
              <h6 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Focus Areas</h6>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-medium">Manifestation:</span> {moonData.spiritual_significance.manifestation_focus}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Release:</span> {moonData.spiritual_significance.release_focus}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <h6 className="font-medium text-purple-700 dark:text-purple-300 text-sm">Practices</h6>
                </div>
                <div className="space-y-1">
                  {moonData.spiritual_significance.practices.slice(0, 3).map((practice, index) => (
                    <span key={index} className="inline-block bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {practice}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Gem className="w-4 h-4 text-purple-500" />
                  <h6 className="font-medium text-purple-700 dark:text-purple-300 text-sm">Crystals</h6>
                </div>
                <div className="space-y-1">
                  {moonData.spiritual_significance.crystals.slice(0, 3).map((crystal, index) => (
                    <span key={index} className="inline-block bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {crystal}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  <h6 className="font-medium text-purple-700 dark:text-purple-300 text-sm">Herbs</h6>
                </div>
                <div className="space-y-1">
                  {moonData.spiritual_significance.herbs.slice(0, 3).map((herb, index) => (
                    <span key={index} className="inline-block bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {herb}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-purple-200 dark:border-purple-800">
        <span>
          {lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : 'Never updated'}
        </span>
        <div className="flex items-center gap-2">
          {autoUpdate && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Auto-updating
            </span>
          )}
          <span>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>
    </div>
  );
}
