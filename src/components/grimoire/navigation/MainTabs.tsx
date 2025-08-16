'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MainTabsProps {
  activeTab: 'library' | 'daily' | 'correspondences' | 'settings';
  onTabChange: (tab: 'library' | 'daily' | 'correspondences' | 'settings') => void;
  entryCount: number;
  collectionCount: number;
  className?: string;
}

const tabs = [
  {
    id: 'library' as const,
    label: 'Library',
    icon: '📚',
    description: 'Browse and manage your entries',
  },
  {
    id: 'daily' as const,
    label: 'Daily Practice',
    icon: '🌙',
    description: 'Daily rituals and journaling',
  },
  {
    id: 'correspondences' as const,
    label: 'Correspondences',
    icon: '📊',
    description: 'Magical associations and references',
  },
  {
    id: 'settings' as const,
    label: 'Settings',
    icon: '⚙️',
    description: 'Vault configuration and preferences',
  },
];

export function MainTabs({ 
  activeTab, 
  onTabChange, 
  entryCount, 
  collectionCount, 
  className 
}: MainTabsProps) {
  return (
    <nav className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                
                {/* Show counts for relevant tabs */}
                {tab.id === 'library' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {entryCount}
                  </span>
                )}
                
                {tab.id === 'correspondences' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {collectionCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
