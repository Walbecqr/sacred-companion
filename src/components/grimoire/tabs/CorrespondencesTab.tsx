'use client';

import React, { useState } from 'react';
import { GrimoireVault, GrimoireEntry } from '@/types/grimoire';
import { cn } from '@/lib/utils';

interface CorrespondencesTabProps {
  vault: GrimoireVault;
  entries: GrimoireEntry[];
  className?: string;
}

export function CorrespondencesTab({
  vault,
  entries,
  className,
}: CorrespondencesTabProps) {
  const [activeSection, setActiveSection] = useState<'browser' | 'personal' | 'integration'>('browser');

  // Get personal correspondences from entries
  const personalCorrespondences = entries.filter(entry => entry.type === 'correspondence');

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Correspondences</h2>
            <p className="text-gray-600 mt-1">
              Explore magical associations and create personal correspondences
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {personalCorrespondences.length}
              </div>
              <div className="text-sm text-gray-500">Personal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                1,247
              </div>
              <div className="text-sm text-gray-500">Universal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveSection('browser')}
            className={cn(
              'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeSection === 'browser'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span>🔍</span>
            <span>Browse Universal</span>
          </button>
          
          <button
            onClick={() => setActiveSection('personal')}
            className={cn(
              'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeSection === 'personal'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span>📚</span>
            <span>Personal Collection</span>
          </button>
          
          <button
            onClick={() => setActiveSection('integration')}
            className={cn(
              'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeSection === 'integration'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span>🔗</span>
            <span>Integration</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'browser' && (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Universal Correspondence Browser
                </h3>
                <p className="mb-4">
                  Browse the comprehensive database of magical correspondences, 
                  including herbs, crystals, colors, and more.
                </p>
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Open Correspondence Browser
                </button>
                <p className="text-sm text-gray-400 mt-2">
                  This will open the existing correspondence system
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'personal' && (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Correspondences
                </h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  + Create New
                </button>
              </div>

              {personalCorrespondences.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Personal Correspondences Yet
                  </h4>
                  <p className="mb-4">
                    Start building your personal collection of magical correspondences.
                  </p>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Create Your First Correspondence
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personalCorrespondences.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">📊</span>
                        <h4 className="font-medium text-gray-900">{entry.title}</h4>
                      </div>
                      {entry.content && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {entry.content}
                        </p>
                      )}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                              +{entry.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'integration' && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Integration Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Integration Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto-sync with Universal Database</h4>
                      <p className="text-sm text-gray-600">
                        Automatically import new correspondences from the universal database
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked 
                        aria-label="Auto-sync with Universal Database"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Suggest Missing Correspondences</h4>
                      <p className="text-sm text-gray-600">
                        Get AI suggestions for correspondences you might be missing
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked 
                        aria-label="Suggest Missing Correspondences"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Cross-reference with Entries</h4>
                      <p className="text-sm text-gray-600">
                        Automatically link correspondences with your spells and rituals
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        aria-label="Cross-reference with Entries"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">📥</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Import from Universal</h4>
                      <p className="text-sm text-gray-600">Import correspondences to your personal collection</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">📤</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Export Personal</h4>
                      <p className="text-sm text-gray-600">Export your personal correspondences</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">🔍</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Find Missing</h4>
                      <p className="text-sm text-gray-600">Discover correspondences you might need</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">🔗</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Link Entries</h4>
                      <p className="text-sm text-gray-600">Connect correspondences with your entries</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
