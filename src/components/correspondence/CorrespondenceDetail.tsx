'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Eye, 
  Calendar, 
  Globe, 
  Sparkles,
  Book,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';
import { CorrespondenceDetailProps } from '@/types/correspondence';

const CorrespondenceDetail: React.FC<CorrespondenceDetailProps> = ({
  correspondence,
  isFavorited,
  onFavoriteToggle,
  onClose,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const handleCopyToClipboard = async () => {
    const text = `${correspondence.name}\n${correspondence.description || ''}\nMagical Uses: ${correspondence.magical_uses.join(', ')}`;
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getRarityInfo = () => {
    switch (correspondence.rarity_level) {
      case 'common': return { label: 'Common', color: 'text-green-600 dark:text-green-400', icon: '⚪' };
      case 'uncommon': return { label: 'Uncommon', color: 'text-blue-600 dark:text-blue-400', icon: '🔹' };
      case 'rare': return { label: 'Rare', color: 'text-purple-600 dark:text-purple-400', icon: '⭐' };
      case 'very_rare': return { label: 'Very Rare', color: 'text-red-600 dark:text-red-400', icon: '💎' };
      default: return { label: 'Unknown', color: 'text-gray-600 dark:text-gray-400', icon: '❓' };
    }
  };

  const rarity = getRarityInfo();

  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, title, icon, children }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
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
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            {correspondence.category_display_name && (
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white mb-3"
                style={{ backgroundColor: correspondence.category_color }}
              >
                {correspondence.category_display_name}
              </span>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {correspondence.name}
            </h1>
            
            {correspondence.scientific_name && (
              <p className="text-lg text-gray-600 dark:text-gray-400 italic mb-2">
                {correspondence.scientific_name}
              </p>
            )}
            
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className={`flex items-center gap-1 ${rarity.color}`}>
                {rarity.icon} {rarity.label}
              </span>
              
              {correspondence.view_count > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {correspondence.view_count} views
                </span>
              )}
              
              {correspondence.origin_culture && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {correspondence.origin_culture}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleCopyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onFavoriteToggle(correspondence.id, !isFavorited)}
              className={`p-2 transition-colors ${
                isFavorited 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Overview */}
          <CollapsibleSection
            id="overview"
            title="Overview"
            icon={<Info className="w-5 h-5 text-blue-500" />}
          >
            <div className="space-y-4 pt-4">
              {correspondence.description && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {correspondence.description}
                  </p>
                </div>
              )}
              
              {/* Alternative names */}
              {(correspondence.traditional_names?.length || correspondence.common_names?.length) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Alternative Names</h4>
                  <div className="space-y-1">
                    {correspondence.traditional_names?.length && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Traditional:</span> {correspondence.traditional_names.join(', ')}
                      </p>
                    )}
                    {correspondence.common_names?.length && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Common:</span> {correspondence.common_names.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Magical Properties */}
          <CollapsibleSection
            id="magical"
            title="Magical Properties"
            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          >
            <div className="space-y-4 pt-4">
              {/* Magical uses */}
              {correspondence.magical_uses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Magical Uses</h4>
                  <div className="flex flex-wrap gap-2">
                    {correspondence.magical_uses.map((use, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Correspondences */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {correspondence.elemental_associations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Elements</h4>
                    <div className="space-y-1">
                      {correspondence.elemental_associations.map((element, index) => (
                        <span key={index} className="block text-sm text-gray-600 dark:text-gray-400">
                          🜃 {element}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {correspondence.planetary_associations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Planets</h4>
                    <div className="space-y-1">
                      {correspondence.planetary_associations.map((planet, index) => (
                        <span key={index} className="block text-sm text-gray-600 dark:text-gray-400">
                          ☉ {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {correspondence.zodiac_associations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Zodiac</h4>
                    <div className="space-y-1">
                      {correspondence.zodiac_associations.map((sign, index) => (
                        <span key={index} className="block text-sm text-gray-600 dark:text-gray-400">
                          ♈ {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Practical Information */}
          {(correspondence.usage_notes || correspondence.preparation_methods?.length || correspondence.seasonal_availability?.length) && (
            <CollapsibleSection
              id="practical"
              title="Practical Information"
              icon={<Book className="w-5 h-5 text-green-500" />}
            >
              <div className="space-y-4 pt-4">
                {correspondence.usage_notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Usage Notes</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {correspondence.usage_notes}
                    </p>
                  </div>
                )}

                {correspondence.preparation_methods?.length && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preparation Methods</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {correspondence.preparation_methods.map((method, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {correspondence.seasonal_availability?.length && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Seasonal Availability</h4>
                    <div className="flex flex-wrap gap-2">
                      {correspondence.seasonal_availability.map((season, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm"
                        >
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Safety Warnings */}
          {correspondence.safety_warnings && Object.keys(correspondence.safety_warnings).length > 0 && (
            <CollapsibleSection
              id="safety"
              title="Safety Information"
              icon={<Shield className="w-5 h-5 text-red-500" />}
            >
              <div className="pt-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    ⚠️ Important Safety Information
                  </h4>
                  <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
                    {Object.entries(correspondence.safety_warnings).map(([key, value]) => (
                      <p key={key}>
                        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Historical & Cultural Context */}
          {(correspondence.historical_significance || correspondence.origin_culture) && (
            <CollapsibleSection
              id="history"
              title="Historical & Cultural Context"
              icon={<Calendar className="w-5 h-5 text-amber-500" />}
            >
              <div className="space-y-4 pt-4">
                {correspondence.historical_significance && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Historical Significance</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {correspondence.historical_significance}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>

      {/* Copy notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default CorrespondenceDetail;
