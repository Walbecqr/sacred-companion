'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  Gem, 
  Grid3X3, 
  List,
  ChevronDown,
  X,
  BookOpen
} from 'lucide-react';
import { 
  CorrespondenceWithCategory,
  CorrespondenceCategory,
  CorrespondenceSearchParams,
  DEFAULT_CORRESPONDENCE_LIMIT,
  DEFAULT_SEARCH_DEBOUNCE
} from '@/types/correspondence';

import CorrespondenceGrid from '../../../components/correspondence/CorrespondenceGrid';
import CategoryBrowser from '../../../components/correspondence/CategoryBrowser';
import CorrespondenceDetail from '../../../components/correspondence/CorrespondenceDetail';
import SearchFilters from '../../../components/correspondence/SearchFilters';

export default function CorrespondencesPage() {
  // State management
  const [correspondences, setCorrespondences] = useState<CorrespondenceWithCategory[]>([]);
  const [categories, setCategories] = useState<CorrespondenceCategory[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // UI State
  const [selectedCorrespondence, setSelectedCorrespondence] = useState<CorrespondenceWithCategory | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');
  
  // Search and filter state
  const [searchParams, setSearchParams] = useState<CorrespondenceSearchParams>({
    query: '',
    sort_by: 'name',
    sort_order: 'asc',
    limit: DEFAULT_CORRESPONDENCE_LIMIT,
    offset: 0,
  });

  // Debounced search
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadFavorites();
    performSearch({ ...searchParams, offset: 0 });
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/correspondences/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Failed to load categories:', result.error);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load user favorites
  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/correspondences/favorites');
      const result = await response.json();
      
      if (result.success) {
        const favoriteIds = new Set<string>(result.data.map((fav: { correspondence_id: string }) => fav.correspondence_id));
        setFavorites(favoriteIds);
      } else {
        console.error('Failed to load favorites:', result.error);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Perform search
  const performSearch = async (params: CorrespondenceSearchParams, append = false) => {
    try {
      setSearchLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            queryParams.set(key, value.join(','));
          } else {
            queryParams.set(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/correspondences?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        const newCorrespondences = result.data.data;
        
        if (append) {
          setCorrespondences(prev => [...prev, ...newCorrespondences]);
        } else {
          setCorrespondences(newCorrespondences);
        }
        
        setHasMore(result.data.has_more);
        setTotalCount(result.data.total_count);
      } else {
        setError(result.error || 'Failed to load correspondences');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setError('Failed to load correspondences');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Debounced search handler
  const handleSearch = useCallback((newParams: Partial<CorrespondenceSearchParams>) => {
    const updatedParams = { ...searchParams, ...newParams, offset: 0 };
    setSearchParams(updatedParams);

    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(updatedParams);
    }, DEFAULT_SEARCH_DEBOUNCE);

    setSearchDebounceTimeout(timeout);
  }, [searchParams, searchDebounceTimeout]);

  // Load more results
  const handleLoadMore = () => {
    if (!hasMore || searchLoading) return;
    
    const newParams = { 
      ...searchParams, 
      offset: (searchParams.offset || 0) + (searchParams.limit || DEFAULT_CORRESPONDENCE_LIMIT) 
    };
    setSearchParams(newParams);
    performSearch(newParams, true);
  };

  // Toggle favorite
  const handleFavoriteToggle = async (correspondenceId: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        // Add to favorites
        const response = await fetch('/api/correspondences/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correspondence_id: correspondenceId }),
        });
        
        if (response.ok) {
          setFavorites(prev => new Set([...prev, correspondenceId]));
        }
      } else {
        // Remove from favorites
        const response = await fetch(`/api/correspondences/favorites?correspondence_id=${correspondenceId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(correspondenceId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Track correspondence view
  const handleCorrespondenceView = async (correspondenceId: string) => {
    try {
      await fetch('/api/correspondences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          correspondence_id: correspondenceId, 
          action: 'view' 
        }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Category selection handler
  const handleCategorySelect = (categoryName: string | null) => {
    handleSearch({ category: categoryName || undefined });
  };

  // Computed values
  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.name === searchParams.category);
  }, [categories, searchParams.category]);

  const filteredCorrespondences = useMemo(() => {
    if (activeTab === 'favorites') {
      return correspondences.filter(corr => favorites.has(corr.id));
    }
    return correspondences;
  }, [correspondences, favorites, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-200 dark:border-purple-800">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gem className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Correspondence Database
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalCount.toLocaleString()} magical correspondences across {categories.length} categories
                </p>
              </div>
            </div>
            
            {/* View controls */}
            <div className="flex items-center gap-2">
                          <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-r border-purple-200 dark:border-purple-800 h-[calc(100vh-theme(spacing.24))] overflow-y-auto">
          {/* Tabs */}
          <div className="p-4 border-b border-purple-200 dark:border-purple-700">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-1" />
                All
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-1" />
                Favorites ({favorites.size})
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'recent'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Recent
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-purple-200 dark:border-purple-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search correspondences..."
                value={searchParams.query || ''}
                onChange={(e) => handleSearch({ query: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Category Browser */}
          <div className="p-4">
            <CategoryBrowser
              categories={categories}
              selectedCategory={searchParams.category}
              onCategorySelect={handleCategorySelect}
              showItemCounts={true}
              layout="list"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Selected category header */}
          {selectedCategory && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: selectedCategory.color_hex }}
                  >
                    {selectedCategory.icon_name === 'Leaf' ? '🍃' : 
                     selectedCategory.icon_name === 'Heart' ? '❤️' : 
                     selectedCategory.icon_name === 'Gem' ? '💎' : '✨'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedCategory.display_name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCategory.item_count} items • {selectedCategory.description}
                    </p>
                  </div>
                </div>
                              <button
                onClick={() => handleCategorySelect(null)}
                title="Clear category filter"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
              </div>
            </div>
          )}

          {/* Results */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <CorrespondenceGrid
              correspondences={filteredCorrespondences}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              onCorrespondenceView={(id: string) => {
                handleCorrespondenceView(id);
                const correspondence = correspondences.find(c => c.id === id);
                if (correspondence) {
                  setSelectedCorrespondence(correspondence);
                }
              }}
              loading={loading || searchLoading}
              hasMore={hasMore && activeTab === 'all'}
              onLoadMore={handleLoadMore}
              viewMode={viewMode}
              emptyMessage={
                activeTab === 'favorites' 
                  ? "No favorites yet. Click the heart icon on any correspondence to add it to your favorites."
                  : "No correspondences found. Try adjusting your search or filters."
              }
            />
          )}
        </div>
      </div>

      {/* Correspondence Detail Modal */}
      {selectedCorrespondence && (
        <CorrespondenceDetail
          correspondence={selectedCorrespondence}
          isFavorited={favorites.has(selectedCorrespondence.id)}
          onFavoriteToggle={handleFavoriteToggle}
          onClose={() => setSelectedCorrespondence(null)}
        />
      )}

      {/* Advanced Filters Modal */}
      {showFilters && (
        <SearchFilters
          searchParams={searchParams}
          onSearchParamsChange={handleSearch}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
