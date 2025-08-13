'use client';

import { useState } from 'react';
import { 
  X, 
  Filter, 
  RotateCcw,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { 
  CorrespondenceSearchParams, 
  CORRESPONDENCE_SORT_OPTIONS,
  RARITY_LEVELS,
  ELEMENTAL_ASSOCIATIONS,
  PLANETARY_ASSOCIATIONS,
  ZODIAC_ASSOCIATIONS
} from '@/types/correspondence';

interface SearchFiltersProps {
  searchParams: CorrespondenceSearchParams;
  onSearchParamsChange: (newParams: Partial<CorrespondenceSearchParams>) => void;
  onClose: () => void;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchParams,
  onSearchParamsChange,
  onClose,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['sort', 'properties'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleArrayToggle = (
    field: keyof CorrespondenceSearchParams,
    value: string,
    currentArray: string[] = []
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onSearchParamsChange({
      [field]: newArray.length > 0 ? newArray : undefined
    });
  };

  const resetFilters = () => {
    onSearchParamsChange({
      magical_uses: undefined,
      elemental_associations: undefined,
      planetary_associations: undefined,
      zodiac_associations: undefined,
      rarity_level: undefined,
      origin_culture: undefined,
      featured_only: undefined,
      sort_by: 'name',
      sort_order: 'asc',
    });
  };

  const FilterSection: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
  }> = ({ id, title, children }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="pb-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Filters
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4 space-y-0">
          
          {/* Sort Options */}
          <FilterSection id="sort" title="Sort By">
            <div className="space-y-2">
              {CORRESPONDENCE_SORT_OPTIONS.map((option) => {
                const isSelected = searchParams.sort_by === option.value && 
                                 searchParams.sort_order === option.order;
                
                return (
                  <label key={`${option.value}-${option.order}`} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={isSelected}
                      onChange={() => onSearchParamsChange({
                        sort_by: option.value,
                        sort_order: option.order
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Properties */}
          <FilterSection id="properties" title="Properties">
            <div className="space-y-3">
              {/* Featured only */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchParams.featured_only || false}
                  onChange={(e) => onSearchParamsChange({
                    featured_only: e.target.checked || undefined
                  })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured correspondences only
                </span>
              </label>

              {/* Rarity */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Rarity Level
                </h4>
                <div className="space-y-1">
                  {RARITY_LEVELS.map((rarity) => (
                    <label key={rarity.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchParams.rarity_level?.includes(rarity.value) || false}
                        onChange={() => handleArrayToggle(
                          'rarity_level',
                          rarity.value,
                          searchParams.rarity_level
                        )}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span 
                        className="ml-2 text-sm font-medium"
                        style={{ color: rarity.color }}
                      >
                        {rarity.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Correspondences */}
          <FilterSection id="correspondences" title="Magical Correspondences">
            <div className="space-y-4">
              {/* Elements */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Elements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ELEMENTAL_ASSOCIATIONS.map((element) => {
                    const isSelected = searchParams.elemental_associations?.includes(element) || false;
                    return (
                      <button
                        key={element}
                        onClick={() => handleArrayToggle(
                          'elemental_associations',
                          element,
                          searchParams.elemental_associations
                        )}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {element}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Planets */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Planets
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PLANETARY_ASSOCIATIONS.map((planet) => {
                    const isSelected = searchParams.planetary_associations?.includes(planet) || false;
                    return (
                      <button
                        key={planet}
                        onClick={() => handleArrayToggle(
                          'planetary_associations',
                          planet,
                          searchParams.planetary_associations
                        )}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {planet}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zodiac */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Zodiac Signs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ZODIAC_ASSOCIATIONS.map((sign) => {
                    const isSelected = searchParams.zodiac_associations?.includes(sign) || false;
                    return (
                      <button
                        key={sign}
                        onClick={() => handleArrayToggle(
                          'zodiac_associations',
                          sign,
                          searchParams.zodiac_associations
                        )}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {sign}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Origin Culture */}
          <FilterSection id="culture" title="Origin & Culture">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Origin Culture
              </label>
              <input
                type="text"
                value={searchParams.origin_culture || ''}
                onChange={(e) => onSearchParamsChange({
                  origin_culture: e.target.value || undefined
                })}
                placeholder="e.g., Mediterranean, Celtic, Native American"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear All
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
