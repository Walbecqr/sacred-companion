'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { GrimoireSearchParams, EntryType, ENTRY_TYPES, ENTRY_STATUSES } from '@/types/grimoire';

interface FilterSidebarProps {
  filters: GrimoireSearchParams;
  onFiltersChange: (filters: GrimoireSearchParams) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    types: true,
    status: true,
    tags: true,
    dates: false,
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle type filter changes
  const handleTypeChange = (type: EntryType, checked: boolean) => {
    const newTypes = checked
      ? [...(filters.types || []), type]
      : (filters.types || []).filter(t => t !== type);
    
    onFiltersChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  // Handle status filter changes
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...(filters.status || []), status]
      : (filters.status || []).filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  // Handle tag filter changes
  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...(filters.tags || []), tag]
      : (filters.tags || []).filter(t => t !== tag);
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  // Handle date filter changes
  const handleDateFromChange = (date: string) => {
    onFiltersChange({
      ...filters,
      date_from: date || undefined,
    });
  };

  const handleDateToChange = (date: string) => {
    onFiltersChange({
      ...filters,
      date_to: date || undefined,
    });
  };

  // Handle sort changes
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sort_by: sortBy as any,
      sort_order: sortOrder,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.types?.length ||
    filters.status?.length ||
    filters.tags?.length ||
    filters.date_from ||
    filters.date_to ||
    filters.query
  );

  return (
    <div className={cn('bg-white border-r border-gray-200 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Entry Types Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('types')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
        >
          <span>Entry Types</span>
          <span className="text-gray-400">
            {expandedSections.types ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.types && (
          <div className="space-y-2">
            {Object.entries(ENTRY_TYPES).map(([type, config]) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.types?.includes(type as EntryType) || false}
                  onChange={(e) => handleTypeChange(type as EntryType, e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  {config.icon} {config.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('status')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
        >
          <span>Status</span>
          <span className="text-gray-400">
            {expandedSections.status ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.status && (
          <div className="space-y-2">
            {Object.entries(ENTRY_STATUSES).map(([status, config]) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={(e) => handleStatusChange(status, e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tags Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('tags')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
        >
          <span>Tags</span>
          <span className="text-gray-400">
            {expandedSections.tags ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.tags && (
          <div className="space-y-2">
            {/* This would be populated with actual tags from entries */}
            <div className="text-sm text-gray-500 italic">
              No tags available yet
            </div>
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('dates')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
        >
          <span>Date Range</span>
          <span className="text-gray-400">
            {expandedSections.dates ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.dates && (
          <div className="space-y-3">
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                id="date-from"
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filter entries from this date"
              />
            </div>
            
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                id="date-to"
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filter entries to this date"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                  <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sort"
                value="title-asc"
                checked={filters.sort_by === 'title' && filters.sort_order === 'asc'}
                onChange={() => handleSortChange('title', 'asc')}
                className="text-indigo-600 focus:ring-indigo-500"
                aria-label="Sort by title ascending"
              />
              <span className="text-sm text-gray-700">Title (A-Z)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sort"
                value="title-desc"
                checked={filters.sort_by === 'title' && filters.sort_order === 'desc'}
                onChange={() => handleSortChange('title', 'desc')}
                className="text-indigo-600 focus:ring-indigo-500"
                aria-label="Sort by title descending"
              />
              <span className="text-sm text-gray-700">Title (Z-A)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sort"
                value="created-desc"
                checked={filters.sort_by === 'created_at' && filters.sort_order === 'desc'}
                onChange={() => handleSortChange('created_at', 'desc')}
                className="text-indigo-600 focus:ring-indigo-500"
                aria-label="Sort by creation date newest first"
              />
              <span className="text-sm text-gray-700">Newest First</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sort"
                value="created-asc"
                checked={filters.sort_by === 'created_at' && filters.sort_order === 'asc'}
                onChange={() => handleSortChange('created_at', 'asc')}
                className="text-indigo-600 focus:ring-indigo-500"
                aria-label="Sort by creation date oldest first"
              />
              <span className="text-sm text-gray-700">Oldest First</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sort"
                value="updated-desc"
                checked={filters.sort_by === 'updated_at' && filters.sort_order === 'desc'}
                onChange={() => handleSortChange('updated_at', 'desc')}
                className="text-indigo-600 focus:ring-indigo-500"
                aria-label="Sort by update date recently updated first"
              />
              <span className="text-sm text-gray-700">Recently Updated</span>
            </label>
          </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Active Filters</h4>
          <div className="space-y-1">
            {filters.types?.length && (
              <div className="text-sm text-gray-600">
                Types: {filters.types.length} selected
              </div>
            )}
            {filters.status?.length && (
              <div className="text-sm text-gray-600">
                Status: {filters.status.length} selected
              </div>
            )}
            {filters.tags?.length && (
              <div className="text-sm text-gray-600">
                Tags: {filters.tags.length} selected
              </div>
            )}
            {(filters.date_from || filters.date_to) && (
              <div className="text-sm text-gray-600">
                Date range: {filters.date_from} to {filters.date_to}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
