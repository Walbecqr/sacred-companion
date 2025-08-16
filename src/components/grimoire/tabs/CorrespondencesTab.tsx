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
      { id: '1', name: 'Elements', description: 'Earth, Air, Fire, Water', color: '#10b981' },
      { id: '2', name: 'Planets', description: 'Planetary correspondences', color: '#8b5cf6' },
      { id: '3', name: 'Zodiac Signs', description: 'Astrological correspondences', color: '#f59e0b' },
      { id: '4', name: 'Crystals', description: 'Crystal and stone properties', color: '#06b6d4' },
      { id: '5', name: 'Herbs', description: 'Herbal correspondences', color: '#84cc16' },
      { id: '6', name: 'Colors', description: 'Color magic and symbolism', color: '#ef4444' },
    ];

    const mockCorrespondences: Correspondence[] = [
      {
        id: '1',
        name: 'Earth Element',
        category_id: '1',
        description: 'Grounding, stability, fertility, material wealth',
        properties: ['grounding', 'stability', 'fertility', 'wealth'],
        associations: ['north', 'winter', 'midnight', 'black', 'brown'],
        uses: ['grounding rituals', 'prosperity spells', 'fertility magic'],
        notes: 'Associated with the North direction and winter season',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Fire Element',
        category_id: '1',
        description: 'Passion, transformation, energy, purification',
        properties: ['passion', 'transformation', 'energy', 'purification'],
        associations: ['south', 'summer', 'noon', 'red', 'orange'],
        uses: ['courage spells', 'purification rituals', 'energy work'],
        notes: 'Associated with the South direction and summer season',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Moon',
        category_id: '2',
        description: 'Intuition, emotions, cycles, feminine energy',
        properties: ['intuition', 'emotions', 'cycles', 'feminine'],
        associations: ['silver', 'white', 'water', 'night'],
        uses: ['divination', 'emotional healing', 'lunar rituals'],
        notes: 'Rules over emotions, intuition, and the subconscious',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Amethyst',
        category_id: '4',
        description: 'Spiritual protection, peace, healing',
        properties: ['protection', 'peace', 'healing', 'spirituality'],
        associations: ['purple', 'crown chakra', 'spirituality'],
        uses: ['protection spells', 'meditation', 'healing rituals'],
        notes: 'Excellent for spiritual work and protection',
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
      corr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      corr.properties.some(prop => prop.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || corr.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
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
                    {category.name}
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
                const category = getCategoryById(correspondence.category_id);

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
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
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

                    {/* Properties */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Properties</h4>
                      <div className="flex flex-wrap gap-1">
                        {correspondence.properties.map((property) => (
                          <span
                            key={property}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                          >
                            {property}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Associations */}
                    {correspondence.associations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Associations</h4>
                        <div className="flex flex-wrap gap-1">
                          {correspondence.associations.map((association) => (
                            <span
                              key={association}
                              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                            >
                              {association}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uses */}
                    {correspondence.uses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Common Uses</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {correspondence.uses.map((use) => (
                            <li key={use} className="flex items-start space-x-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>{use}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {correspondence.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 italic">
                          {correspondence.notes}
                        </p>
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
