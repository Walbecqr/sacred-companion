'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft,
  Heart,
  Quote,
  Calendar,
  Tag
} from 'lucide-react';

interface OracleCard {
  id: string;
  title: string;
  content: string;
  card_type: string;
  source?: string;
  image_url?: string;
  tags: string[];
}

interface ShareableCardData {
  card: OracleCard;
  shareable: boolean;
}

export default function SharedOracleCardPage() {
  const params = useParams();
  const cardId = params.id as string;
  
  const [cardData, setCardData] = useState<ShareableCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cardId) return;

    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/oracle/share?card_id=${cardId}&type=preview`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Oracle card not found or is no longer available.');
          } else {
            setError('Failed to load oracle card.');
          }
          return;
        }

        const data: ShareableCardData = await response.json();
        setCardData(data);
      } catch (err) {
        console.error('Error fetching shared card:', err);
        setError('Unable to load oracle card. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  const shareCard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case 'oracle_card': return 'Oracle Card';
      case 'daily_wisdom': return 'Daily Wisdom';
      case 'affirmation': return 'Affirmation';
      case 'guidance': return 'Guidance';
      default: return 'Oracle Message';
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading oracle card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <Quote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Card Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Discover Sacred Companion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cardData || !cardData.card) {
    return null;
  }

  const { card } = cardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-200 dark:border-purple-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">Sacred Companion</span>
            </Link>
            
            <button
              onClick={shareCard}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shared Oracle Card
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            A moment of spiritual wisdom shared with you
          </p>
        </div>

        {/* Oracle Card Display */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Quote className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getCardTypeLabel(card.card_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className={`p-8 bg-gradient-to-br ${getCardTypeStyle(card.card_type)} text-white relative overflow-hidden`}>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Sparkles className="w-full h-full" />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">{card.title}</h2>
                <blockquote className="text-xl leading-relaxed italic">
                  "{card.content}"
                </blockquote>
                
                {card.source && (
                  <p className="text-sm opacity-80 mt-6">— {card.source}</p>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
              {card.tags && card.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  {card.tags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {card.tags.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{card.tags.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Ready for Your Own Spiritual Journey?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join Sacred Companion to receive daily oracle cards, track your spiritual growth, 
              and connect with wisdom from various traditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Start Your Journey
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium"
              >
                <Heart className="w-5 h-5" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-purple-200 dark:border-purple-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Sacred Companion</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Your digital spiritual companion for daily wisdom and growth
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
