'use client';

import React, { useState, useEffect } from 'react';
import { useGrimoire } from '@/contexts/GrimoireContext';
import { GrimoireDashboardProps, EntryType, ENTRY_TYPES } from '@/types/grimoire';
import { cn } from '@/lib/utils';

// Tab components
import { LibraryTab } from './tabs/LibraryTab';
import { DailyPracticeTab } from './tabs/DailyPracticeTab';
import { CorrespondencesTab } from './tabs/CorrespondencesTab';
import { SettingsTab } from './tabs/SettingsTab';

// Navigation components
import { MainTabs } from './navigation/MainTabs';
import { ActionToolbar } from './navigation/ActionToolbar';
import { FilterSidebar } from './navigation/FilterSidebar';

// Utility components
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

type TabType = 'library' | 'daily' | 'correspondences' | 'settings';

export function GrimoireDashboard({ className }: GrimoireDashboardProps) {
  const {
    vault,
    entries,
    collections,
    loading,
    error,
    createEntry,
    searchEntries,
  } = useGrimoire();

  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: '',
    types: [] as EntryType[],
    tags: [] as string[],
    status: [] as string[],
  });

  // Handle search
  const handleSearch = async (params: any) => {
    try {
      await searchEntries(params);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Handle create entry
  const handleCreateEntry = async (type: EntryType) => {
    try {
      const entry = await createEntry(type, {
        title: `New ${ENTRY_TYPES[type].label}`,
        content: '',
        tags: [],
      });
      // Navigate to editor or show success message
      console.log('Created entry:', entry);
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  // Handle import content
  const handleImportContent = () => {
    // Open import modal
    console.log('Open import modal');
  };

  // Handle export vault
  const handleExportVault = () => {
    // Trigger vault export
    console.log('Export vault');
  };

  // Loading state
  if (loading && !vault) {
    return (
      <div className={cn('flex items-center justify-center min-h-screen', className)}>
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg">Loading your Digital Grimoire...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center min-h-screen', className)}>
        <ErrorMessage 
          title="Failed to load Grimoire"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No vault state
  if (!vault) {
    return (
      <div className={cn('flex items-center justify-center min-h-screen', className)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Digital Grimoire</h2>
          <p className="text-gray-600 mb-6">Your personal magical library is being prepared...</p>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-screen bg-gray-50', className)}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {vault.book_name}
            </h1>
            <span className="text-sm text-gray-500">
              {entries.length} entries
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {vault.practice} • {vault.style}
            </span>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <MainTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        entryCount={entries.length}
        collectionCount={collections.length}
      />

      {/* Action Toolbar */}
      <ActionToolbar
        onCreateEntry={handleCreateEntry}
        onImportContent={handleImportContent}
        onExportVault={handleExportVault}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        searchParams={searchParams}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Sidebar */}
        {showFilters && (
          <FilterSidebar
            filters={searchParams}
            onFiltersChange={setSearchParams}
            onClearFilters={() => setSearchParams({
              query: '',
              types: [],
              tags: [],
              status: [],
            })}
            className="w-64 border-r border-gray-200"
          />
        )}

        {/* Tab Content */}
        <main className="flex-1 overflow-auto">
          {activeTab === 'library' && (
            <LibraryTab
              entries={entries}
              collections={collections}
              searchParams={searchParams}
              onSearch={handleSearch}
              onCreateEntry={handleCreateEntry}
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
        </main>
      </div>

      {/* Status Bar */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Vault: {vault.version}</span>
            <span>Last updated: {new Date(vault.updated_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Safety Mode: {vault.safety_mode ? 'On' : 'Off'}</span>
            <span>Privacy: {vault.privacy_level}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
