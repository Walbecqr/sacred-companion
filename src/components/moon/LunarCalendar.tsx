'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import { moonPhaseService } from '@/lib/moon-phase-api';

interface LunarCalendarProps {
  className?: string;
  compact?: boolean;
  monthsToShow?: number;
}

interface PhaseEvent {
  name: string;
  date: Date;
  daysFromNow: number;
}

export default function LunarCalendar({ 
  className = '', 
  compact = false,
  monthsToShow = 3 
}: LunarCalendarProps) {
  const [upcomingPhases, setUpcomingPhases] = useState<PhaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchUpcomingPhases = useCallback(async () => {
    try {
      const phases = await moonPhaseService.getUpcomingPhases(monthsToShow * 4);
      setUpcomingPhases(phases);
    } catch (error) {
      console.error('Failed to fetch upcoming phases:', error);
    } finally {
      setLoading(false);
    }
  }, [monthsToShow]);

  useEffect(() => {
    fetchUpcomingPhases();
  }, [fetchUpcomingPhases]);

  const getMoonPhaseIcon = (phaseName: string) => {
    const iconMap: Record<string, string> = {
      'New Moon': '🌑',
      'First Quarter': '🌓',
      'Full Moon': '🌕',
      'Last Quarter': '🌗'
    };
    return iconMap[phaseName] || '🌙';
  };

  const getPhaseColor = (phaseName: string) => {
    const colorMap: Record<string, string> = {
      'New Moon': 'bg-gray-900 text-white',
      'First Quarter': 'bg-yellow-500 text-white',
      'Full Moon': 'bg-blue-100 text-blue-900 border-2 border-blue-300',
      'Last Quarter': 'bg-orange-500 text-white'
    };
    return colorMap[phaseName] || 'bg-purple-500 text-white';
  };

  const formatDate = (date: Date, includeTime = false) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      ...(includeTime && { hour: 'numeric', minute: '2-digit' })
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getPhaseForDate = (date: Date) => {
    return upcomingPhases.find(phase => isSameDay(phase.date, date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const renderCalendarGrid = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const phase = getPhaseForDate(date);
      const isToday = isSameDay(date, new Date());

      days.push(
        <div key={day} className="relative h-8 w-8 flex items-center justify-center">
          <span className={`text-sm ${isToday ? 'font-bold text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
            {day}
          </span>
          {phase && (
            <div className="absolute -top-1 -right-1">
              <span 
                className="text-xs"
                title={`${phase.name} - ${formatDate(phase.date, true)}`}
              >
                {getMoonPhaseIcon(phase.name)}
              </span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-600 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lunar Calendar</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Upcoming Phases</h4>
        </div>
        <div className="space-y-2">
          {upcomingPhases.slice(0, 4).map((phase, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{getMoonPhaseIcon(phase.name)}</span>
                <span className="text-gray-700 dark:text-gray-300">{phase.name}</span>
              </div>
              <div className="text-right">
                <div className="text-purple-700 dark:text-purple-300 font-medium">
                  {formatDate(phase.date)}
                </div>
                <div className="text-xs text-gray-500">
                  {phase.daysFromNow === 0 ? 'Today' : 
                   phase.daysFromNow === 1 ? 'Tomorrow' : 
                   `${phase.daysFromNow} days`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lunar Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-purple-600" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white px-3">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarGrid(currentMonth)}
        </div>
      </div>

      {/* Phase Legend */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Upcoming Moon Phases</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {upcomingPhases.slice(0, 6).map((phase, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getMoonPhaseIcon(phase.name)}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{phase.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(phase.date, true)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {phase.daysFromNow === 0 ? 'Today' : 
                   phase.daysFromNow === 1 ? 'Tomorrow' : 
                   `${phase.daysFromNow} days`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h5 className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">Phase Guide</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>🌑</span>
            <span className="text-gray-600 dark:text-gray-400">New Moon - New beginnings</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🌓</span>
            <span className="text-gray-600 dark:text-gray-400">First Quarter - Action</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🌕</span>
            <span className="text-gray-600 dark:text-gray-400">Full Moon - Manifestation</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🌗</span>
            <span className="text-gray-600 dark:text-gray-400">Last Quarter - Release</span>
          </div>
        </div>
      </div>
    </div>
  );
}
