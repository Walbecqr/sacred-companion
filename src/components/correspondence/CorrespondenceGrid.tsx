'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Heart, 
  Eye, 
  Star, 
  Sparkles, 
  ChevronRight,
  Loader2,
  Grid3X3,
  List
} from 'lucide-react';
import { CorrespondenceGridProps, CorrespondenceWithCategory } from '@/types/correspondence';

const CorrespondenceCard: React.FC<{
  correspondence: CorrespondenceWithCategory;
  isFavorited: boolean;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
  onView: (id: string) => void;
  compact?: boolean;
}> = ({ correspondence, isFavorited, onFavoriteToggle, onView, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'text-green-600 dark:text-green-400';
      case 'uncommon': return 'text-blue-600 dark:text-blue-400';
      case 'rare': return 'text-purple-600 dark:text-purple-400';
      case 'very_rare': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'very_rare': return '💎';
      case 'rare': return '⭐';
      case 'uncommon': return '🔹';
      default: return '⚪';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer ${
        compact ? 'p-3' : 'p-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(correspondence.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {correspondence.name}
          </h3>
          {correspondence.scientific_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic truncate">
              {correspondence.scientific_name}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {/* Rarity indicator */}
          {correspondence.rarity_level && correspondence.rarity_level !== 'common' && (
            <span 
              className="text-sm" 
              title={`Rarity: ${correspondence.rarity_level}`}
              aria-label={`Rarity: ${correspondence.rarity_level}`}
            >
              {getRarityIcon(correspondence.rarity_level)}
            </span>
          )}
          
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(correspondence.id, !isFavorited);
            }}
            className={`p-1 rounded transition-colors ${
              isFavorited 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category badge */}
      {correspondence.category_display_name && (
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: correspondence.category_color }}
          >
            {correspondence.category_display_name}
          </span>
          {correspondence.view_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Eye className="w-3 h-3" />
              {correspondence.view_count}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {!compact && correspondence.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
          {correspondence.description}
        </p>
      )}

      {/* Magical uses */}
      {correspondence.magical_uses && correspondence.magical_uses.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {correspondence.magical_uses.slice(0, compact ? 2 : 3).map((use, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
              >
                {use}
              </span>
            ))}
            {correspondence.magical_uses.length > (compact ? 2 : 3) && (
              <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{correspondence.magical_uses.length - (compact ? 2 : 3)} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Associations */}
      {!compact && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {correspondence.elemental_associations && correspondence.elemental_associations.length > 0 && (
              <span title={`Element: ${correspondence.elemental_associations.join(', ')}`}>
                🜃 {correspondence.elemental_associations[0]}
              </span>
            )}
            {correspondence.planetary_associations && correspondence.planetary_associations.length > 0 && (
              <span title={`Planet: ${correspondence.planetary_associations.join(', ')}`}>
                ☉ {correspondence.planetary_associations[0]}
              </span>
            )}
          </div>
          
          {isHovered && (
            <ChevronRight className="w-4 h-4 text-purple-500" />
          )}
        </div>
      )}
    </div>
  );
};

const CorrespondenceGrid: React.FC<CorrespondenceGridProps> = ({
  correspondences,
  favorites,
  onFavoriteToggle,
  onCorrespondenceView,
  loading = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = 'No correspondences found.',
  viewMode = 'grid',
  className = '',
}) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Intersection observer for infinite scroll
  const lastCorrespondenceRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        setLoadingMore(true);
        onLoadMore();
        setTimeout(() => setLoadingMore(false), 1000);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, onLoadMore]);

  const handleFavoriteToggle = async (correspondenceId: string, isFavorited: boolean) => {
    try {
      await onFavoriteToggle(correspondenceId, isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading && correspondences.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading correspondences...</p>
        </div>
      </div>
    );
  }

  if (!loading && correspondences.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'space-y-3';

  return (
    <div className={className}>
      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {correspondences.length.toLocaleString()} correspondence{correspondences.length !== 1 ? 's' : ''}
        </p>
        
        {loading && correspondences.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Grid */}
      <div className={gridClasses}>
        {correspondences.map((correspondence, index) => {
          const isLast = index === correspondences.length - 1;
          
          return (
            <div
              key={correspondence.id}
              ref={isLast ? lastCorrespondenceRef : undefined}
            >
              <CorrespondenceCard
                correspondence={correspondence}
                isFavorited={favorites.has(correspondence.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onView={onCorrespondenceView}
                compact={viewMode === 'list'}
              />
            </div>
          );
        })}
      </div>

      {/* Load more indicator */}
      {hasMore && (
        <div ref={loadMoreRef} className="mt-8 text-center">
          {loadingMore ? (
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading more...
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrespondenceGrid;
