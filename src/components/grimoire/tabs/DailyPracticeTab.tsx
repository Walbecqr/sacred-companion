'use client';

import React, { useState, useEffect } from 'react';
import { GrimoireVault, GrimoireEntry, DailyPractice, PracticeSuggestion, MoonPhase } from '@/types/grimoire';
import { cn } from '@/lib/utils';

interface DailyPracticeTabProps {
  vault: GrimoireVault;
  entries: GrimoireEntry[];
  className?: string;
}

export function DailyPracticeTab({
  entries,
  className,
}: DailyPracticeTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyPractice, setDailyPractice] = useState<DailyPractice | null>(null);
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);

  // Mock moon phase data (in real implementation, this would come from an API)
  useEffect(() => {
    const mockMoonPhase: MoonPhase = {
      phase: 'Waxing Crescent',
      illumination: 0.25,
      date: selectedDate,
      zodiac_sign: 'Taurus',
      element: 'Earth',
    };
    setMoonPhase(mockMoonPhase);
  }, [selectedDate]);

  // Mock daily practice suggestions
  useEffect(() => {
    const suggestions: PracticeSuggestion[] = [
      {
        id: '1',
        type: 'meditation',
        title: 'Moon Phase Meditation',
        description: 'Meditate on the waxing crescent energy for growth and intention setting',
        duration: 15,
        difficulty: 'beginner',
        correspondences: ['moon', 'growth', 'intention'],
      },
      {
        id: '2',
        type: 'ritual',
        title: 'Crystal Charging Ritual',
        description: 'Charge your crystals under the waxing moon for amplified energy',
        duration: 30,
        difficulty: 'intermediate',
        correspondences: ['crystals', 'charging', 'energy'],
        entry_id: entries.find(e => e.type === 'ritual')?.id,
      },
      {
        id: '3',
        type: 'study',
        title: 'Taurus Correspondences',
        description: 'Study the correspondences of Taurus and earth element',
        duration: 20,
        difficulty: 'beginner',
        correspondences: ['taurus', 'earth', 'correspondences'],
      },
    ];

    const practice: DailyPractice = {
      date: selectedDate,
      moon_phase: moonPhase || undefined,
      suggestions,
      completed_entries: [],
      journal_entry: journalEntry,
      mood,
      energy_level: energyLevel,
    };

    setDailyPractice(practice);
  }, [selectedDate, moonPhase, journalEntry, mood, energyLevel, entries]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleSuggestionComplete = (suggestionId: string) => {
    if (dailyPractice) {
      const updatedPractice = {
        ...dailyPractice,
        completed_entries: [...dailyPractice.completed_entries, suggestionId],
      };
      setDailyPractice(updatedPractice);
    }
  };

  const handleJournalSave = () => {
    if (dailyPractice) {
      const updatedPractice = {
        ...dailyPractice,
        journal_entry: journalEntry,
        mood,
        energy_level: energyLevel,
      };
      setDailyPractice(updatedPractice);
      // Here you would save to the database
      console.log('Saving daily practice:', updatedPractice);
    }
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Daily Practice</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Select date for daily practice"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Moon Phase Card */}
          {moonPhase && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Moon Phase</h3>
                  <p className="text-2xl font-bold mb-1">{moonPhase.phase}</p>
                  <p className="text-indigo-100">
                    {moonPhase.zodiac_sign} • {moonPhase.element} Element
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-indigo-300 rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full"
                          style={{ width: `${moonPhase.illumination * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{Math.round(moonPhase.illumination * 100)}% illuminated</span>
                    </div>
                  </div>
                </div>
                <div className="text-6xl">🌙</div>
              </div>
            </div>
          )}

          {/* Practice Suggestions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Suggestions</h3>
            <div className="space-y-4">
              {dailyPractice?.suggestions.map((suggestion) => {
                const isCompleted = dailyPractice.completed_entries.includes(suggestion.id);
                
                return (
                  <div
                    key={suggestion.id}
                    className={cn(
                      'border rounded-lg p-4 transition-colors',
                      isCompleted
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">
                            {suggestion.type === 'meditation' && '🧘'}
                            {suggestion.type === 'ritual' && '🕯️'}
                            {suggestion.type === 'study' && '📚'}
                            {suggestion.type === 'reflection' && '🤔'}
                            {suggestion.type === 'correspondence' && '📊'}
                          </span>
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {suggestion.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>⏱️ {suggestion.duration} min</span>
                          {suggestion.correspondences && (
                            <div className="flex items-center space-x-1">
                              <span>🏷️</span>
                              {suggestion.correspondences.slice(0, 2).map((corr) => (
                                <span key={corr} className="px-1 py-0.5 bg-gray-100 rounded">
                                  {corr}
                                </span>
                              ))}
                              {suggestion.correspondences.length > 2 && (
                                <span>+{suggestion.correspondences.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSuggestionComplete(suggestion.id)}
                        className={cn(
                          'ml-4 px-3 py-1 rounded text-sm font-medium transition-colors',
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        )}
                      >
                        {isCompleted ? '✓ Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Journal */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Journal</h3>
            
            {/* Mood and Energy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling today?</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Select your mood for today"
                >
                  <option value="">Select mood...</option>
                  <option value="peaceful">😌 Peaceful</option>
                  <option value="energized">⚡ Energized</option>
                  <option value="contemplative">🤔 Contemplative</option>
                  <option value="grateful">🙏 Grateful</option>
                  <option value="creative">🎨 Creative</option>
                  <option value="focused">🎯 Focused</option>
                  <option value="tired">😴 Tired</option>
                  <option value="stressed">😰 Stressed</option>
                  <option value="joyful">😊 Joyful</option>
                  <option value="mystical">✨ Mystical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level: {energyLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full"
                  aria-label="Set your energy level from 1 to 10"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Journal Entry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Today&apos;s Reflection
              </label>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Write about your spiritual practice, insights, or experiences today..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleJournalSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Save Journal Entry
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="text-2xl mb-2">🕯️</span>
                <span className="text-sm font-medium">Light Candle</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="text-2xl mb-2">🧘</span>
                <span className="text-sm font-medium">Meditate</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="text-2xl mb-2">📚</span>
                <span className="text-sm font-medium">Study</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="text-2xl mb-2">✨</span>
                <span className="text-sm font-medium">Gratitude</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
