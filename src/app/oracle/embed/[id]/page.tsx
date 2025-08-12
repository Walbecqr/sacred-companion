'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Sparkles, Quote, ExternalLink } from 'lucide-react';

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

export default function EmbedOracleCardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cardId = params.id as string;
  
  const attribution = searchParams.get('attribution') !== 'false';
  const personalNote = searchParams.get('note') || '';
  
  const [cardData, setCardData] = useState<ShareableCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardId) return;

    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/oracle/share?card_id=${cardId}&type=embed`);
        
        if (!response.ok) {
          setError('Card not available');
          return;
        }

        const data: ShareableCardData = await response.json();
        setCardData(data);
      } catch (err) {
        console.error('Error fetching embed card:', err);
        setError('Unable to load card');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

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
      <div className="min-h-[300px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData || !cardData.card) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Quote className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{error || 'Card not available'}</p>
        </div>
      </div>
    );
  }

  const { card } = cardData;

  return (
    <div className="min-h-[300px] bg-white font-sans">
      <div className={`h-full p-6 bg-gradient-to-br ${getCardTypeStyle(card.card_type)} text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
          <Sparkles className="w-full h-full" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3 leading-tight">{card.title}</h3>
            <blockquote className="text-base italic leading-relaxed">
              &ldquo;{card.content}&rdquo;
            </blockquote>
            
            {attribution && card.source && (
              <p className="text-sm opacity-80 mt-4">— {card.source}</p>
            )}
            
            {personalNote && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg text-sm">
                {decodeURIComponent(personalNote)}
              </div>
            )}
          </div>
          
          {attribution && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center gap-2 text-xs opacity-70">
                <Sparkles className="w-3 h-3" />
                <span>Sacred Companion</span>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                <span>Visit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
