'use client';

import { useState } from 'react';
import { CorrespondenceCategory, CategoryBrowserProps } from '@/types/correspondence';
import { ChevronRight, Grid3X3, List } from 'lucide-react';

const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  showItemCounts = true,
  layout = 'list',
  className = '',
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getCategoryIcon = (iconName: string) => {
    // Map icon names to actual icons/emojis
    const iconMap: Record<string, string> = {
      'Leaf': '🍃',
      'Heart': '❤️',
      'Gem': '💎',
      'Crown': '👑',
      'Palette': '🎨',
      'Zap': '⚡',
      'Globe': '🌍',
      'Star': '⭐',
      'Hash': '#️⃣',
      'Square': '🔲',
      'Triangle': '🔺',
      'Flame': '🔥',
      'Droplets': '💧',
      'Moon': '🌙',
      'Calendar': '📅',
      'Circle': '⭕',
      'Navigation': '🧭',
      'Wand': '🪄',
      'Hexagon': '⬡',
      'BookOpen': '📖',
    };
    return iconMap[iconName] || '✨';
  };

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onCategorySelect(null); // Deselect if already selected
    } else {
      onCategorySelect(categoryName);
    }
  };

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:bg-purple-25 dark:hover:bg-purple-900/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl" aria-hidden="true">
                  {getCategoryIcon(category.icon_name || '')}
                </span>
                {isSelected && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color_hex }}
                  />
                )}
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                {category.display_name}
              </h3>
              {showItemCounts && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {category.item_count.toLocaleString()} items
                </p>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* All Categories Option */}
      <button
        onClick={() => onCategorySelect(null)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
          !selectedCategory
            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">📚</span>
          <span className="font-medium">All Categories</span>
        </div>
        {showItemCounts && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {categories.reduce((sum, cat) => sum + cat.item_count, 0).toLocaleString()}
          </span>
        )}
      </button>

      {/* Individual Categories */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.name;
        const isExpanded = expandedCategory === category.name;
        
        return (
          <div key={category.id}>
            <button
              onClick={() => handleCategoryClick(category.name)}
              onMouseEnter={() => setExpandedCategory(category.name)}
              onMouseLeave={() => setExpandedCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                isSelected
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {getCategoryIcon(category.icon_name || '')}
                </span>
                <span className="font-medium text-sm">{category.display_name}</span>
                {isSelected && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color_hex }}
                  />
                )}
              </div>
              {showItemCounts && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {category.item_count.toLocaleString()}
                </span>
              )}
            </button>

            {/* Category Description Tooltip */}
            {isExpanded && category.description && (
              <div className="ml-8 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 border-l-2 border-purple-200 dark:border-purple-700">
                {category.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBrowser;
