'use client';

import React, { useState } from 'react';
import { GrimoireVault, GrimoireEntry, SearchFilters, EntryType } from '@/types/grimoire';
import { EntryCard } from '../entries/EntryCard';
import { cn } from '@/lib/utils';

interface LibraryTabProps {
  vault: GrimoireVault;
  entries: GrimoireEntry[];
  searchParams: SearchFilters;
  onSearch: (query: string) => void;
  className?: string;
}

export function LibraryTab({
  vault,
  entries,
  searchParams,
  onSearch,
  className,
}: LibraryTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'index'>('grid');
  const [selectedEntry, setSelectedEntry] = useState<GrimoireEntry | null>(null);

  // Calculate stats
  const stats = {
    total: entries.length,
    byType: entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<EntryType, number>),
    byStatus: entries.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const handleViewEntry = (entry: GrimoireEntry) => {
    setSelectedEntry(entry);
  };

  const handleEditEntry = (entry: GrimoireEntry) => {
    // TODO: Implement edit functionality
    console.log('Edit entry:', entry);
  };

  const handleDeleteEntry = (entry: GrimoireEntry) => {
    // TODO: Implement delete functionality
    console.log('Delete entry:', entry);
  };

  const handleDuplicateEntry = (entry: GrimoireEntry) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate entry:', entry);
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Library</h2>
            <p className="text-sm text-gray-600">
              {entries.length} entries in your grimoire
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              aria-label="List view"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('index')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'index'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              aria-label="Index view"
            >
              ⋮
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your Grimoire is Empty
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your magical knowledge by creating your first entry.
              </p>
              <div className="flex justify-center space-x-3">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Create Spell
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Create Ritual
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Create Note
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Stats Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.byStatus.active || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.byStatus.draft || 0}
                  </div>
                  <div className="text-sm text-gray-600">Drafts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {Object.keys(stats.byType).length}
                  </div>
                  <div className="text-sm text-gray-600">Types</div>
                </div>
              </div>
            </div>

            {/* Entries Grid/List */}
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              )}
            >
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onView={handleViewEntry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  onDuplicate={handleDuplicateEntry}
                  layout={viewMode === 'grid' ? 'full' : 'compact'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entry Viewer Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEntry.title}
                </h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close entry viewer"
                >
                  ✕
                </button>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {selectedEntry.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
