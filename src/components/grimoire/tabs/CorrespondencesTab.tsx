'use client';

import React, { useState, useEffect } from 'react';
import { GrimoireVault, GrimoireEntry } from '@/types/grimoire';
import { Correspondence, CorrespondenceCategory } from '@/types/correspondence';
import { cn } from '@/lib/utils';

interface CorrespondencesTabProps {
  vault: GrimoireVault;
  entries: GrimoireEntry[];
  className?: string;
}

export function CorrespondencesTab({
  className,
}: CorrespondencesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
  const [categories, setCategories] = useState<CorrespondenceCategory[]>([]);

  // Mock correspondence data (in real implementation, this would come from the correspondence API)
  useEffect(() => {
    const mockCategories: CorrespondenceCategory[] = [
      { 
        id: '1', 
        name: 'elements', 
        display_name: 'Elements', 
        description: 'Earth, Air, Fire, Water', 
        color_hex: '#10b981',
        sort_order: 1,
        item_count: 4,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '2', 
        name: 'planets', 
        display_name: 'Planets', 
        description: 'Planetary correspondences', 
        color_hex: '#8b5cf6',
        sort_order: 2,
        item_count: 7,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '3', 
        name: 'zodiac', 
        display_name: 'Zodiac Signs', 
        description: 'Astrological correspondences', 
        color_hex: '#f59e0b',
        sort_order: 3,
        item_count: 12,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '4', 
        name: 'crystals', 
        display_name: 'Crystals', 
        description: 'Crystal and stone properties', 
        color_hex: '#06b6d4',
        sort_order: 4,
        item_count: 20,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '5', 
        name: 'herbs', 
        display_name: 'Herbs', 
        description: 'Herbal correspondences', 
        color_hex: '#84cc16',
        sort_order: 5,
        item_count: 15,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '6', 
        name: 'colors', 
        display_name: 'Colors', 
        description: 'Color magic and symbolism', 
        color_hex: '#ef4444',
        sort_order: 6,
        item_count: 8,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];

    const mockCorrespondences: Correspondence[] = [
      {
        id: '1',
        name: 'Earth Element',
        category: 'elements',
        description: 'Grounding, stability, fertility, material wealth',
        magical_uses: ['grounding rituals', 'prosperity spells', 'fertility magic'],
        elemental_associations: ['earth'],
        planetary_associations: ['saturn'],
        zodiac_associations: ['capricorn', 'taurus'],
        properties: {
          grounding: true,
          stability: true,
          fertility: true,
          wealth: true
        },
        associations: {
          direction: 'north',
          season: 'winter',
          time: 'midnight',
          colors: ['black', 'brown']
        },
        safety_warnings: {},
        view_count: 0,
        popularity_score: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Fire Element',
        category: 'elements',
        description: 'Passion, transformation, energy, purification',
        magical_uses: ['courage spells', 'purification rituals', 'energy work'],
        elemental_associations: ['fire'],
        planetary_associations: ['mars'],
        zodiac_associations: ['aries', 'leo'],
        properties: {
          passion: true,
          transformation: true,
          energy: true,
          purification: true
        },
        associations: {
          direction: 'south',
          season: 'summer',
          time: 'noon',
          colors: ['red', 'orange']
        },
        safety_warnings: {},
        view_count: 0,
        popularity_score: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Moon',
        category: 'planets',
        description: 'Intuition, emotions, cycles, feminine energy',
        magical_uses: ['divination', 'emotional healing', 'lunar rituals'],
        elemental_associations: ['water'],
        planetary_associations: ['moon'],
        zodiac_associations: ['cancer'],
        properties: {
          intuition: true,
          emotions: true,
          cycles: true,
          feminine: true
        },
        associations: {
          colors: ['silver', 'white'],
          element: 'water',
          time: 'night'
        },
        safety_warnings: {},
        view_count: 0,
        popularity_score: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Amethyst',
        category: 'crystals',
        description: 'Spiritual protection, peace, healing',
        magical_uses: ['protection spells', 'meditation', 'healing rituals'],
        elemental_associations: ['air'],
        planetary_associations: ['jupiter'],
        zodiac_associations: ['pisces'],
        properties: {
          protection: true,
          peace: true,
          healing: true,
          spirituality: true
        },
        associations: {
          colors: ['purple'],
          chakra: 'crown',
          element: 'spirituality'
        },
        safety_warnings: {},
        view_count: 0,
        popularity_score: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    setCategories(mockCategories);
    setCorrespondences(mockCorrespondences);
  }, []);

  // Filter correspondences based on search and category
  const filteredCorrespondences = correspondences.filter(corr => {
    const matchesSearch = searchQuery === '' ||
      corr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (corr.description && corr.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      corr.magical_uses.some(use => use.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || corr.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const getCategoryByName = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName);
  };

  const handleAddToGrimoire = (correspondence: Correspondence) => {
    // This would create a new grimoire entry based on the correspondence
    console.log('Add to grimoire:', correspondence);
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Magical Correspondences</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredCorrespondences.length} correspondences
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search correspondences..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Search correspondences"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={cn(
                    'px-3 py-2 text-sm rounded-lg transition-colors',
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      'px-3 py-2 text-sm rounded-lg transition-colors',
                      selectedCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {category.display_name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Correspondences Grid */}
          {filteredCorrespondences.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Correspondences Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {filteredCorrespondences.map((correspondence) => {
                 const category = getCategoryByName(correspondence.category);

                return (
                  <div
                    key={correspondence.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {category && (
                            <span
                              className="px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: category.color_hex }}
                            >
                              {category.display_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {correspondence.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {correspondence.description}
                        </p>
                      </div>
                    </div>

                                         {/* Magical Uses */}
                     <div className="mb-4">
                       <h4 className="text-sm font-medium text-gray-900 mb-2">Magical Uses</h4>
                       <div className="flex flex-wrap gap-1">
                         {correspondence.magical_uses.map((use) => (
                           <span
                             key={use}
                             className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                           >
                             {use}
                           </span>
                         ))}
                       </div>
                     </div>

                                         {/* Elemental Associations */}
                     {correspondence.elemental_associations.length > 0 && (
                       <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-900 mb-2">Elemental Associations</h4>
                         <div className="flex flex-wrap gap-1">
                           {correspondence.elemental_associations.map((element) => (
                             <span
                               key={element}
                               className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                             >
                               {element}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Planetary Associations */}
                     {correspondence.planetary_associations.length > 0 && (
                       <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-900 mb-2">Planetary Associations</h4>
                         <div className="flex flex-wrap gap-1">
                           {correspondence.planetary_associations.map((planet) => (
                             <span
                               key={planet}
                               className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                             >
                               {planet}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                                         {/* Zodiac Associations */}
                     {correspondence.zodiac_associations.length > 0 && (
                       <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-900 mb-2">Zodiac Associations</h4>
                         <div className="flex flex-wrap gap-1">
                           {correspondence.zodiac_associations.map((sign) => (
                             <span
                               key={sign}
                               className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded"
                             >
                               {sign}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleAddToGrimoire(correspondence)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                      >
                        Add to Grimoire
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900">Quick Reference:</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">Elements</span>
              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">Planets</span>
              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">Zodiac</span>
            </div>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700">
            View All Categories
          </button>
        </div>
      </div>
    </div>
  );
}
