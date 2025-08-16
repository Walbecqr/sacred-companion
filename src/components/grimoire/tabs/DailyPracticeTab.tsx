'use client';

import React, { useState } from 'react';
import { GrimoireVault, GrimoireEntry } from '@/types/grimoire';
import { cn } from '@/lib/utils';

interface DailyPracticeTabProps {
  vault: GrimoireVault;
  entries: GrimoireEntry[];
  className?: string;
}

export function DailyPracticeTab({
  vault,
  entries,
  className,
}: DailyPracticeTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalEntry, setJournalEntry] = useState('');
  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);

  // Get today's date
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // Get moon phase (placeholder)
  const getMoonPhase = () => ({
    phase: 'Waxing Crescent',
    illumination: 0.3,
    zodiac_sign: 'Taurus',
    element: 'Earth',
  });

  // Get daily suggestions
  const getDailySuggestions = () => [
    {
      id: '1',
      type: 'meditation' as const,
      title: 'Morning Meditation',
      description: 'Start your day with a 10-minute grounding meditation',
      duration: 10,
      difficulty: 'beginner' as const,
    },
    {
      id: '2',
      type: 'ritual' as const,
      title: 'Daily Gratitude',
      description: 'Express gratitude for three things in your life',
      duration: 5,
      difficulty: 'beginner' as const,
    },
    {
      id: '3',
      type: 'study' as const,
      title: 'Learn About Moon Phases',
      description: 'Research the current moon phase and its significance',
      duration: 15,
      difficulty: 'intermediate' as const,
    },
  ];

  const moonPhase = getMoonPhase();
  const suggestions = getDailySuggestions();

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Today's Overview */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date and Moon Phase */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isToday ? 'Today' : selectedDate.toLocaleDateString()}
            </h2>
            <div className="text-sm text-gray-500">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Moon Phase */}
          <div className="text-center">
            <div className="text-3xl mb-2">🌙</div>
            <div className="text-lg font-semibold text-gray-900">
              {moonPhase.phase}
            </div>
            <div className="text-sm text-gray-500">
              {moonPhase.zodiac_sign} • {moonPhase.element}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${moonPhase.illumination * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {entries.filter(e => {
                const entryDate = new Date(e.created_at);
                return entryDate.toDateString() === selectedDate.toDateString();
              }).length}
            </div>
            <div className="text-sm text-gray-500">Entries Today</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column - Suggestions and Quick Actions */}
          <div className="space-y-6">
            {/* Daily Suggestions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today's Suggestions
              </h3>
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {suggestion.type === 'meditation' && '🧘'}
                        {suggestion.type === 'ritual' && '🕯️'}
                        {suggestion.type === 'study' && '📚'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {suggestion.duration} min
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {suggestion.difficulty}
                        </span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Rituals */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Rituals
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg text-center hover:from-purple-100 hover:to-indigo-100 transition-colors">
                  <div className="text-2xl mb-2">🕯️</div>
                  <div className="text-sm font-medium text-gray-900">Candle Magic</div>
                  <div className="text-xs text-gray-500">5 min</div>
                </button>
                <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center hover:from-green-100 hover:to-emerald-100 transition-colors">
                  <div className="text-2xl mb-2">🌿</div>
                  <div className="text-sm font-medium text-gray-900">Herb Work</div>
                  <div className="text-xs text-gray-500">10 min</div>
                </button>
                <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg text-center hover:from-blue-100 hover:to-cyan-100 transition-colors">
                  <div className="text-2xl mb-2">💎</div>
                  <div className="text-sm font-medium text-gray-900">Crystal Charging</div>
                  <div className="text-xs text-gray-500">15 min</div>
                </button>
                <button className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center hover:from-yellow-100 hover:to-orange-100 transition-colors">
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="text-sm font-medium text-gray-900">Sun Salutation</div>
                  <div className="text-xs text-gray-500">8 min</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Journal and Mood Tracking */}
          <div className="space-y-6">
            {/* Daily Journal */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Journal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are you feeling today?
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Select your mood for today"
                  >
                    <option value="">Select your mood...</option>
                    <option value="energized">⚡ Energized</option>
                    <option value="peaceful">😌 Peaceful</option>
                    <option value="creative">🎨 Creative</option>
                    <option value="focused">🎯 Focused</option>
                    <option value="tired">😴 Tired</option>
                    <option value="stressed">😰 Stressed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level (1-10)
                  </label>
                  <div className="flex items-center space-x-2">
                                         <input
                       type="range"
                       min="1"
                       max="10"
                       value={energyLevel}
                       onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                       className="flex-1"
                       aria-label="Energy level from 1 to 10"
                     />
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {energyLevel}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Reflection
                  </label>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Write about your spiritual journey today..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Save Entry
                </button>
              </div>
            </div>

            {/* Practice Calendar */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Practice Calendar
              </h3>
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>Calendar view coming soon...</p>
                <p className="text-sm">Track your daily practice streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
