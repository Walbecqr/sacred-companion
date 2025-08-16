'use client';

import React, { useState } from 'react';
import { GrimoireEntry, GrimoireCollection, EntryType, ENTRY_TYPES, ENTRY_STATUSES } from '@/types/grimoire';
import { EntryCard } from '../entries/EntryCard';
import { cn } from '@/lib/utils';

interface LibraryTabProps {
  entries: GrimoireEntry[];
  collections: GrimoireCollection[];
  searchParams: any;
  onSearch: (params: any) => void;
  onCreateEntry: (type: EntryType) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'index';

export function LibraryTab({
  entries,
  collections,
  searchParams,
  onSearch,
  onCreateEntry,
  className,
}: LibraryTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedEntry, setSelectedEntry] = useState<GrimoireEntry | null>(null);

  // Handle entry actions
  const handleViewEntry = (entry: GrimoireEntry) => {
    setSelectedEntry(entry);
  };

  const handleEditEntry = (entry: GrimoireEntry) => {
    // Navigate to editor or open edit modal
    console.log('Edit entry:', entry);
  };

  const handleDeleteEntry = (entry: GrimoireEntry) => {
    // Show confirmation dialog and delete
    console.log('Delete entry:', entry);
  };

  const handleDuplicateEntry = (entry: GrimoireEntry) => {
    // Duplicate the entry
    console.log('Duplicate entry:', entry);
  };

  // Get entry statistics
  const getEntryStats = () => {
    const stats = {
      total: entries.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      recent: entries.filter(e => {
        const daysSinceUpdate = (Date.now() - new Date(e.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate <= 7;
      }).length,
    };

    entries.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
    });

    return stats;
  };

  const stats = getEntryStats();

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Stats Panel */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
            <div className="text-sm text-gray-500">Recently Updated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{collections.length}</div>
            <div className="text-sm text-gray-500">Collections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(stats.byType).length}
            </div>
            <div className="text-sm text-gray-500">Entry Types</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your Grimoire is Empty
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Start building your magical library by creating your first entry. 
              Choose from spells, rituals, correspondences, and more.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(ENTRY_TYPES).slice(0, 6).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => onCreateEntry(type as EntryType)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <span>{config.icon}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Entries grid/list
          <div className="p-6">
            {/* View mode selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-3 py-1 text-sm rounded transition-colors',
                      viewMode === 'grid'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-3 py-1 text-sm rounded transition-colors',
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('index')}
                    className={cn(
                      'px-3 py-1 text-sm rounded transition-colors',
                      viewMode === 'index'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Index
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                {entries.length} entries
              </div>
            </div>

            {/* Entries display */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onView={handleViewEntry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onDuplicate={handleDuplicateEntry}
                    compact={false}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onView={handleViewEntry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onDuplicate={handleDuplicateEntry}
                    compact={true}
                  />
                ))}
              </div>
            )}

            {viewMode === 'index' && (
              <div className="space-y-6">
                {/* Group by type */}
                {Object.entries(ENTRY_TYPES).map(([type, config]) => {
                  const typeEntries = entries.filter(e => e.type === type);
                  if (typeEntries.length === 0) return null;

                  return (
                    <div key={type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg">{config.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {config.label}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({typeEntries.length})
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {typeEntries.map((entry) => (
                          <EntryCard
                            key={entry.id}
                            entry={entry}
                            onView={handleViewEntry}
                            onEdit={handleEditEntry}
                            onDelete={handleDeleteEntry}
                            onDuplicate={handleDuplicateEntry}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entry Viewer Modal (placeholder) */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedEntry.title}
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{ENTRY_TYPES[selectedEntry.type].icon} {ENTRY_TYPES[selectedEntry.type].label}</span>
                <span>•</span>
                <span>{ENTRY_STATUSES[selectedEntry.status].label}</span>
                <span>•</span>
                <span>Updated {new Date(selectedEntry.updated_at).toLocaleDateString()}</span>
              </div>
              
              {selectedEntry.content && (
                <div className="prose max-w-none">
                  <p>{selectedEntry.content}</p>
                </div>
              )}
              
              {selectedEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => handleEditEntry(selectedEntry)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
