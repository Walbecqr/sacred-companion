'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Quote, 
  RefreshCw, 
  Heart, 
  Share2, 
  Clock,
  Sparkles,
  Moon,
  Sun,
  Star,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface OracleCard {
  id: string;
  title: string;
  content: string;
  card_type: string;
  spiritual_paths?: string[];
  experience_levels?: string[];
  seasonal_timing?: string[];
  correspondences?: Record<string, unknown>;
  tags?: string[];
  source?: string;
  image_url?: string;
}

interface OracleCardResponse {
  card: OracleCard;
  is_manual_draw: boolean;
  draws_remaining: number;
  draws_limit: number;
}

interface OracleCardProps {
  className?: string;
  userTimezone?: string;
}

export default function OracleCardComponent({ 
  className = '', 
  userTimezone = 'UTC' 
}: OracleCardProps) {
  const [oracleCard, setOracleCard] = useState<OracleCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawsRemaining, setDrawsRemaining] = useState(3);
  const [drawsLimit, setDrawsLimit] = useState(3);
  const [isManualDraw, setIsManualDraw] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch daily oracle card
  const fetchOracleCard = useCallback(async (forceNew = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timezone: userTimezone,
        ...(forceNew && { force_new: 'true' })
      });

      const response = await fetch(`/api/oracle/daily?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          setError(`Daily draw limit reached (${errorData.limit} max)`);
          return;
        }
        throw new Error('Failed to fetch oracle card');
      }

      const data: OracleCardResponse = await response.json();
      setOracleCard(data.card);
      setDrawsRemaining(data.draws_remaining);
      setDrawsLimit(data.draws_limit);
      setIsManualDraw(data.is_manual_draw);
      setLastUpdate(new Date());
      setIsSaved(false); // Reset saved state for new card
      
    } catch (err) {
      console.error('Error fetching oracle card:', err);
      setError('Unable to load your oracle card. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userTimezone]);

  // Save oracle card to collection
  const saveOracleCard = async () => {
    if (!oracleCard) return;

    try {
      const response = await fetch('/api/oracle/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oracle_card_id: oracleCard.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save oracle card');
      }

      const data = await response.json();
      setIsSaved(true);
      
      // Show success feedback
      setTimeout(() => setIsSaved(false), 3000);

    } catch (err) {
      console.error('Error saving oracle card:', err);
      setError('Unable to save card. Please try again.');
    }
  };

  // Share oracle card
  const shareOracleCard = async (shareType: 'social_text' | 'public_link' | 'embed_code') => {
    if (!oracleCard) return;

    try {
      setIsSharing(true);

      const response = await fetch('/api/oracle/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oracle_card_id: oracleCard.id,
          share_type: shareType,
          include_attribution: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          setError('Sharing is disabled in your privacy settings');
          return;
        }
        throw new Error('Failed to generate share content');
      }

      const data = await response.json();
      
      if (shareType === 'social_text') {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (shareType === 'public_link') {
        // Open share URL
        window.open(data.url, '_blank');
      } else if (shareType === 'embed_code') {
        // Copy embed code to clipboard
        await navigator.clipboard.writeText(data.iframe_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }

      setShareMenuOpen(false);

    } catch (err) {
      console.error('Error sharing oracle card:', err);
      setError('Unable to share card. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Load initial oracle card
  useEffect(() => {
    fetchOracleCard();
  }, [fetchOracleCard]);

  // Get time-based icon
  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Star className="w-5 h-5 text-orange-500" />;
    if (hour >= 18 && hour < 22) return <Moon className="w-5 h-5 text-purple-500" />;
    return <Moon className="w-5 h-5 text-indigo-500" />;
  };

  // Get card type styling
  const getCardTypeStyle = (cardType: string) => {
    switch (cardType) {
      case 'oracle_card':
        return 'from-purple-500 to-indigo-600';
      case 'daily_wisdom':
        return 'from-blue-500 to-teal-600';
      case 'affirmation':
        return 'from-pink-500 to-rose-600';
      case 'guidance':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-purple-500 to-indigo-600';
    }
  };

  if (loading && !oracleCard) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Quote className="w-5 h-5 text-purple-600 animate-pulse" />
          <h3 className="font-semibold">Oracle Message</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error && !oracleCard) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Quote className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold">Oracle Message</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchOracleCard()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!oracleCard) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center gap-3">
          {getTimeIcon()}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Oracle Message</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isManualDraw ? 'Manual Draw' : 'Daily Card'} • {drawsRemaining}/{drawsLimit} draws remaining
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOracleCard(true)}
            disabled={loading || drawsRemaining <= 0}
            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={drawsRemaining <= 0 ? 'Daily limit reached' : 'Draw new card'}
          >
            <RefreshCw className={`w-4 h-4 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={saveOracleCard}
            className={`p-2 rounded-lg transition-colors ${
              isSaved 
                ? 'bg-green-100 dark:bg-green-900/50 text-green-600' 
                : 'hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600'
            }`}
            title="Save to collection"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-purple-600"
              title="Share card"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            {shareMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="p-2">
                  <button
                    onClick={() => shareOracleCard('social_text')}
                    disabled={isSharing}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </button>
                  <button
                    onClick={() => shareOracleCard('public_link')}
                    disabled={isSharing}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </button>
                  <button
                    onClick={() => shareOracleCard('embed_code')}
                    disabled={isSharing}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <Quote className="w-4 h-4" />
                    Embed Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className={`p-6 bg-gradient-to-br ${getCardTypeStyle(oracleCard.card_type)} text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Sparkles className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h4 className="text-xl font-semibold mb-3">{oracleCard.title}</h4>
          <blockquote className="text-lg italic leading-relaxed">
            "{oracleCard.content}"
          </blockquote>
          
          {oracleCard.source && (
            <p className="text-sm opacity-80 mt-4">— {oracleCard.source}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {oracleCard.tags && oracleCard.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <span>Tags:</span>
                <span>{oracleCard.tags.slice(0, 3).join(', ')}</span>
                {oracleCard.tags.length > 3 && <span>+{oracleCard.tags.length - 3}</span>}
              </div>
            )}
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {copied && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-sm text-green-600 dark:text-green-400">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
