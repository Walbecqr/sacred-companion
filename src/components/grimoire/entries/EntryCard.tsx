'use client';

import React, { useState } from 'react';
import { GrimoireEntry, ENTRY_TYPES, ENTRY_STATUSES } from '@/types/grimoire';
import { cn } from '@/lib/utils';

interface EntryCardProps {
  entry: GrimoireEntry;
  onView: (entry: GrimoireEntry) => void;
  onEdit: (entry: GrimoireEntry) => void;
  onDelete: (entry: GrimoireEntry) => void;
  onDuplicate: (entry: GrimoireEntry) => void;
  compact?: boolean;
  className?: string;
}

export function EntryCard({
  entry,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  compact = false,
  className,
}: EntryCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const entryType = ENTRY_TYPES[entry.type];
  const entryStatus = ENTRY_STATUSES[entry.status];

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // Handle context menu action
  const handleContextAction = (action: string) => {
    setShowContextMenu(false);
    switch (action) {
      case 'view':
        onView(entry);
        break;
      case 'edit':
        onEdit(entry);
        break;
      case 'duplicate':
        onDuplicate(entry);
        break;
      case 'delete':
        onDelete(entry);
        break;
    }
  };

  // Format content preview
  const getContentPreview = () => {
    if (!entry.content) return 'No content';
    const preview = entry.content.replace(/[#*`]/g, '').trim();
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div className={cn('relative group', className)}>
        <div
          className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onView(entry)}
          onContextMenu={handleContextMenu}
        >
          <div className="flex-shrink-0">
            <span className="text-lg">{entryType.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {entry.title}
              </h3>
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entryStatus.color }}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span>{entryType.label}</span>
              <span>•</span>
              <span>{formatDate(entry.updated_at)}</span>
              {entry.tags.length > 0 && (
                <>
                  <span>•</span>
                  <span>{entry.tags.length} tags</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit"
            >
              ✏️
            </button>
          </div>
        </div>

        {/* Context Menu */}
        {showContextMenu && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <button
              onClick={() => handleContextAction('view')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>👁️</span>
              <span>View</span>
            </button>
            <button
              onClick={() => handleContextAction('edit')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleContextAction('duplicate')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Duplicate</span>
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => handleContextAction('delete')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative group', className)}>
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onView(entry)}
        onContextMenu={handleContextMenu}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{entryType.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {entry.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <span>{entryType.label}</span>
                <span>•</span>
                <span>{formatDate(entry.updated_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: entryStatus.color }}
              title={entryStatus.label}
            />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entry);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Edit"
              >
                ✏️
              </button>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        {entry.content && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-3">
              {getContentPreview()}
            </p>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>v{entry.version}</span>
            {entry.visibility !== 'private' && (
              <>
                <span>•</span>
                <span className="capitalize">{entry.visibility}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {entry.linked_entries.length > 0 && (
              <span title={`${entry.linked_entries.length} linked entries`}>
                🔗 {entry.linked_entries.length}
              </span>
            )}
            {entry.media.length > 0 && (
              <span title={`${entry.media.length} media files`}>
                📎 {entry.media.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <button
              onClick={() => handleContextAction('view')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>👁️</span>
              <span>View</span>
            </button>
            <button
              onClick={() => handleContextAction('edit')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleContextAction('duplicate')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Duplicate</span>
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => handleContextAction('delete')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
