'use client';

import React, { useState } from 'react';
import { useGrimoire } from '@/contexts/GrimoireContext';
import { MainTabs } from './navigation/MainTabs';
import { ActionToolbar } from './navigation/ActionToolbar';
import { FilterSidebar } from './navigation/FilterSidebar';
import { LibraryTab } from './tabs/LibraryTab';
import { DailyPracticeTab } from './tabs/DailyPracticeTab';
import { CorrespondencesTab } from './tabs/CorrespondencesTab';
import { SettingsTab } from './tabs/SettingsTab';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EntryEditor } from './entries/EntryEditor';
import { GrimoireDashboardProps, EntryType, SearchFilters, GrimoireEntry } from '@/types/grimoire';
import { cn } from '@/lib/utils';

export function GrimoireDashboard({ className }: GrimoireDashboardProps) {
  const { vault, entries, loading, error, createEntry } = useGrimoire();
  
  // State for UI
  const [activeTab, setActiveTab] = useState<'library' | 'daily' | 'correspondences' | 'settings'>('library');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showEntryEditor, setShowEntryEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryType | null>(null);

  // Handle entry creation
  const handleCreateEntry = (type: EntryType) => {
    setEditingEntry(type);
    setShowEntryEditor(true);
  };

  const handleSaveEntry = async (entryData: Partial<GrimoireEntry>) => {
    if (!editingEntry) return;
    
    try {
      await createEntry(editingEntry, entryData);
      setShowEntryEditor(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  const handleCancelEntry = () => {
    setShowEntryEditor(false);
    setEditingEntry(null);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, query }));
  };

  // Handle search params (for ActionToolbar)
  const handleSearchParams = (params: { query?: string }) => {
    if (params.query !== undefined) {
      setSearchQuery(params.query);
      setFilters(prev => ({ ...prev, query: params.query }));
    }
  };

  // Handle filters
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-screen', className)}>
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading your grimoire...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-screen', className)}>
        <ErrorMessage
          title="Failed to Load Grimoire"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No vault state
  if (!vault) {
    return (
      <div className={cn('flex items-center justify-center h-screen', className)}>
        <ErrorMessage
          title="No Grimoire Found"
          message="Unable to load your grimoire. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={cn('h-screen flex flex-col bg-gray-50', className)}>
      {/* Main Navigation */}
      <MainTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        entryCount={entries.length}
        collectionCount={0} // TODO: Get from context
      />

      {/* Action Toolbar */}
      <ActionToolbar
        onCreateEntry={handleCreateEntry}
        onImportContent={() => console.log('Import')}
        onExportVault={() => console.log('Export')}
        onSearch={handleSearchParams}
        onToggleFilters={() => setShowFilters(!showFilters)}
        searchParams={{ query: searchQuery }}
        showFilters={showFilters}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter Sidebar */}
        {showFilters && (
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClose={() => setShowFilters(false)}
            isOpen={showFilters}
          />
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'library' && (
            <LibraryTab
              vault={vault}
              entries={entries}
              searchParams={filters}
              onSearch={handleSearch}
            />
          )}
          {activeTab === 'daily' && (
            <DailyPracticeTab
              vault={vault}
              entries={entries}
            />
          )}
          {activeTab === 'correspondences' && (
            <CorrespondencesTab
              vault={vault}
              entries={entries}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              vault={vault}
            />
          )}
        </div>
      </div>

      {/* Entry Editor Modal */}
      {showEntryEditor && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <EntryEditor
              type={editingEntry}
              onSave={handleSaveEntry}
              onCancel={handleCancelEntry}
            />
          </div>
        </div>
      )}
    </div>
  );
}
