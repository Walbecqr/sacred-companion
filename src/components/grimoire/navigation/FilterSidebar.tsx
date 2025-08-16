'use client';

import React, { useState } from 'react';
import { SearchFilters, EntryType, ENTRY_TYPES } from '@/types/grimoire';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
  className,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['type', 'status']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilter = (key: keyof SearchFilters, value: string | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  if (!isOpen) return null;

  return (
    <div className={cn('w-64 bg-white border-r border-gray-200 flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        <button
          onClick={clearFilters}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          Clear all filters
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Entry Type Filter */}
        <div>
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
          >
            Entry Type
            <span className={cn('transform transition-transform', expandedSections.has('type') ? 'rotate-180' : '')}>
              ▼
            </span>
          </button>
          {expandedSections.has('type') && (
            <div className="space-y-2">
              {Object.entries(ENTRY_TYPES).map(([type, config]) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.types?.includes(type as EntryType) || false}
                    onChange={(e) => {
                      const currentTypes = filters.types || [];
                      const newTypes = e.target.checked
                        ? [...currentTypes, type as EntryType]
                        : currentTypes.filter(t => t !== type);
                      updateFilter('types', newTypes.length > 0 ? newTypes : undefined);
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {config.icon} {config.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div>
          <button
            onClick={() => toggleSection('status')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
          >
            Status
            <span className={cn('transform transition-transform', expandedSections.has('status') ? 'rotate-180' : '')}>
              ▼
            </span>
          </button>
          {expandedSections.has('status') && (
            <div className="space-y-2">
              {[
                { value: 'draft', label: 'Draft', color: 'gray' },
                { value: 'active', label: 'Active', color: 'green' },
                { value: 'archived', label: 'Archived', color: 'yellow' },
              ].map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status.value) || false}
                    onChange={(e) => {
                      const currentStatuses = filters.status || [];
                      const newStatuses = e.target.checked
                        ? [...currentStatuses, status.value]
                        : currentStatuses.filter(s => s !== status.value);
                      updateFilter('status', newStatuses.length > 0 ? newStatuses : undefined);
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tags Filter */}
        <div>
          <button
            onClick={() => toggleSection('tags')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
          >
            Tags
            <span className={cn('transform transition-transform', expandedSections.has('tags') ? 'rotate-180' : '')}>
              ▼
            </span>
          </button>
          {expandedSections.has('tags') && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Tag filtering coming soon...</p>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div>
          <button
            onClick={() => toggleSection('date')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
          >
            Date Range
            <span className={cn('transform transition-transform', expandedSections.has('date') ? 'rotate-180' : '')}>
              ▼
            </span>
          </button>
          {expandedSections.has('date') && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={filters.date_range?.start || ''}
                  onChange={(e) => updateFilter('date_range', {
                    start: e.target.value,
                    end: filters.date_range?.end || '',
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={filters.date_range?.end || ''}
                  onChange={(e) => updateFilter('date_range', {
                    start: filters.date_range?.start || '',
                    end: e.target.value,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div>
          <button
            onClick={() => toggleSection('sort')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
          >
            Sort By
            <span className={cn('transform transition-transform', expandedSections.has('sort') ? 'rotate-180' : '')}>
              ▼
            </span>
          </button>
          {expandedSections.has('sort') && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Sort Field</label>
                <select
                  value={filters.sort_by || 'updated_at'}
                  onChange={(e) => updateFilter('sort_by', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="title">Title</option>
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="type">Type</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Order</label>
                <select
                  value={filters.sort_order || 'desc'}
                  onChange={(e) => updateFilter('sort_order', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
