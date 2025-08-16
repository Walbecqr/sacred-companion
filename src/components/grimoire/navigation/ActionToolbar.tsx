'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { EntryType, ENTRY_TYPES, SearchFilters } from '@/types/grimoire';

interface ActionToolbarProps {
  onCreateEntry: (type: EntryType) => void;
  onImportContent: () => void;
  onExportVault: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  searchParams: SearchFilters;
  onSearch: (params: SearchFilters) => void;
  className?: string;
}

export function ActionToolbar({
  onCreateEntry,
  onImportContent,
  onExportVault,
  onToggleFilters,
  showFilters,
  searchParams,
  onSearch,
  className,
}: ActionToolbarProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.query || '');

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      ...searchParams,
      query: searchQuery,
    });
  };

  // Handle create entry menu
  const handleCreateClick = () => {
    setShowCreateMenu(!showCreateMenu);
    setShowImportMenu(false);
  };

  const handleCreateEntry = (type: EntryType) => {
    onCreateEntry(type);
    setShowCreateMenu(false);
  };

  // Handle import menu
  const handleImportClick = () => {
    setShowImportMenu(!showImportMenu);
    setShowCreateMenu(false);
  };

  return (
    <div className={cn('bg-white border-b border-gray-200 px-6 py-3', className)}>
      <div className="flex items-center justify-between">
        {/* Left side - Primary actions */}
        <div className="flex items-center space-x-3">
          {/* Create Entry Button */}
          <div className="relative">
            <button
              onClick={handleCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span>+</span>
              <span>Create Entry</span>
              <span className="text-xs">▼</span>
            </button>

            {/* Create Menu Dropdown */}
            {showCreateMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-1">
                    Choose Entry Type
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(ENTRY_TYPES).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => handleCreateEntry(type as EntryType)}
                        className="flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <span className="text-lg">{config.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {config.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {config.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Import Content Button */}
          <div className="relative">
            <button
              onClick={handleImportClick}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span>📥</span>
              <span>Import</span>
              <span className="text-xs">▼</span>
            </button>

            {/* Import Menu Dropdown */}
            {showImportMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      onImportContent();
                      setShowImportMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span>📝</span>
                    <span>Paste Text Content</span>
                  </button>
                  <button
                    onClick={() => {
                      // Handle file upload
                      setShowImportMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span>📁</span>
                    <span>Upload File</span>
                  </button>
                  <button
                    onClick={() => {
                      // Handle vault import
                      setShowImportMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span>📦</span>
                    <span>Import Vault</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={onExportVault}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>📤</span>
            <span>Export</span>
          </button>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search your grimoire..."
              className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right side - View controls */}
        <div className="flex items-center space-x-3">
          {/* View Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1 text-sm bg-white rounded shadow-sm">
              Grid
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
              List
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
              Index
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
              showFilters
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <span>🏷️</span>
            <span className="text-sm">Filters</span>
          </button>

          {/* Settings */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <span>⚙️</span>
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showCreateMenu || showImportMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCreateMenu(false);
            setShowImportMenu(false);
          }}
        />
      )}
    </div>
  );
}
