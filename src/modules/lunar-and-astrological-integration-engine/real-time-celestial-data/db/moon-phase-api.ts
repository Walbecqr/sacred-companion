import type { 
  MoonPhaseApiResponse, 
  MoonPhaseDisplayData, 
  MoonPhaseError,
  SpiritualSignificance 
} from '@/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/types';

const MOON_PHASE_API_KEY = process.env.NEXT_PUBLIC_MOON_PHASE_API_KEY;
const MOON_PHASE_API_HOST = 'moon-phase.p.rapidapi.com';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const STORAGE_KEY = 'sacred_companion_moon_phase_cache';

// Spiritual significance data for each moon phase
const SPIRITUAL_SIGNIFICANCE: Record<string, SpiritualSignificance> = {
  'New Moon': {
    phase_name: 'New Moon',
    keywords: ['new beginnings', 'intention setting', 'manifestation', 'planning'],
    energy: 'Fresh, receptive, introspective energy perfect for planting seeds of intention',
    practices: ['intention setting', 'meditation', 'journaling', 'planning rituals'],
    manifestation_focus: 'Setting clear intentions and goals for the lunar cycle ahead',
    release_focus: 'Releasing old patterns that no longer serve your highest good',
    meditation_theme: 'Inner wisdom and connecting with your deepest intentions',
    ritual_suggestions: ['Candle magic for new beginnings', 'Vision board creation', 'Seed blessing rituals'],
    colors: ['black', 'deep purple', 'silver'],
    crystals: ['moonstone', 'labradorite', 'black tourmaline'],
    herbs: ['mugwort', 'jasmine', 'sandalwood']
  },
  'Waxing Crescent': {
    phase_name: 'Waxing Crescent',
    keywords: ['growth', 'action', 'momentum', 'development'],
    energy: 'Building energy supporting growth and taking first steps toward goals',
    practices: ['spell work', 'manifestation rituals', 'skill development', 'networking'],
    manifestation_focus: 'Taking concrete steps toward your intentions and building momentum',
    release_focus: 'Releasing doubts and fears about your ability to achieve your goals',
    meditation_theme: 'Courage and confidence in pursuing your path',
    ritual_suggestions: ['Green candle spells for growth', 'Herbal teas for clarity', 'Crystal grids for manifestation'],
    colors: ['light green', 'yellow', 'silver'],
    crystals: ['green aventurine', 'citrine', 'clear quartz'],
    herbs: ['basil', 'mint', 'rosemary']
  },
  'First Quarter': {
    phase_name: 'First Quarter',
    keywords: ['challenges', 'decisions', 'perseverance', 'commitment'],
    energy: 'Dynamic energy for overcoming obstacles and making important decisions',
    practices: ['decision-making rituals', 'protection spells', 'courage work', 'boundary setting'],
    manifestation_focus: 'Pushing through challenges and making crucial decisions',
    release_focus: 'Releasing indecision and fear of making the wrong choice',
    meditation_theme: 'Inner strength and clarity in the face of challenges',
    ritual_suggestions: ['Strength-building rituals', 'Decision clarity spells', 'Protection amulets'],
    colors: ['red', 'orange', 'gold'],
    crystals: ['carnelian', 'tiger\'s eye', 'hematite'],
    herbs: ['ginger', 'cinnamon', 'bay leaves']
  },
  'Waxing Gibbous': {
    phase_name: 'Waxing Gibbous',
    keywords: ['refinement', 'adjustment', 'patience', 'persistence'],
    energy: 'Focused energy for fine-tuning and perfecting your manifestations',
    practices: ['detailed planning', 'skill refinement', 'patience exercises', 'gratitude work'],
    manifestation_focus: 'Refining and adjusting your approach to achieve your goals',
    release_focus: 'Releasing impatience and the need for immediate results',
    meditation_theme: 'Patience, persistence, and trust in the process',
    ritual_suggestions: ['Perfection rituals', 'Patience meditations', 'Gratitude ceremonies'],
    colors: ['blue', 'purple', 'silver'],
    crystals: ['amethyst', 'sodalite', 'fluorite'],
    herbs: ['lavender', 'chamomile', 'sage']
  },
  'Full Moon': {
    phase_name: 'Full Moon',
    keywords: ['culmination', 'manifestation', 'power', 'completion'],
    energy: 'Peak magical energy perfect for manifestation, divination, and celebration',
    practices: ['major rituals', 'divination', 'energy work', 'celebration', 'gratitude'],
    manifestation_focus: 'Manifesting your intentions at their full power',
    release_focus: 'Major releases and cleansing of what no longer serves',
    meditation_theme: 'Divine feminine energy and connection to lunar wisdom',
    ritual_suggestions: ['Moon water creation', 'Crystal charging', 'Major spell work', 'Tarot readings'],
    colors: ['white', 'silver', 'gold'],
    crystals: ['selenite', 'moonstone', 'clear quartz'],
    herbs: ['jasmine', 'rose', 'frankincense']
  },
  'Waning Gibbous': {
    phase_name: 'Waning Gibbous',
    keywords: ['gratitude', 'sharing', 'wisdom', 'teaching'],
    energy: 'Grateful energy for sharing wisdom and expressing appreciation',
    practices: ['gratitude rituals', 'teaching', 'sharing knowledge', 'giving back'],
    manifestation_focus: 'Manifesting opportunities to share your gifts with others',
    release_focus: 'Releasing selfishness and the tendency to hoard knowledge',
    meditation_theme: 'Gratitude, generosity, and sharing wisdom',
    ritual_suggestions: ['Gratitude ceremonies', 'Blessing rituals', 'Community service'],
    colors: ['gold', 'orange', 'yellow'],
    crystals: ['citrine', 'sunstone', 'amber'],
    herbs: ['calendula', 'sunflower', 'orange peel']
  },
  'Last Quarter': {
    phase_name: 'Last Quarter',
    keywords: ['release', 'forgiveness', 'letting go', 'banishing'],
    energy: 'Powerful releasing energy for letting go and breaking unwanted patterns',
    practices: ['banishing rituals', 'forgiveness work', 'cord cutting', 'cleansing'],
    manifestation_focus: 'Manifesting freedom from what holds you back',
    release_focus: 'Major release of habits, relationships, and patterns that limit you',
    meditation_theme: 'Forgiveness, release, and creating space for new growth',
    ritual_suggestions: ['Banishing spells', 'Cord cutting ceremonies', 'Cleansing baths'],
    colors: ['black', 'deep red', 'brown'],
    crystals: ['obsidian', 'black tourmaline', 'smoky quartz'],
    herbs: ['sage', 'cedar', 'eucalyptus']
  },
  'Waning Crescent': {
    phase_name: 'Waning Crescent',
    keywords: ['rest', 'reflection', 'wisdom', 'preparation'],
    energy: 'Quiet, introspective energy perfect for rest and inner wisdom',
    practices: ['meditation', 'journaling', 'divination', 'rest', 'reflection'],
    manifestation_focus: 'Manifesting inner peace and wisdom for the next cycle',
    release_focus: 'Final release of the lunar cycle, clearing space for renewal',
    meditation_theme: 'Inner wisdom, rest, and preparation for new beginnings',
    ritual_suggestions: ['Divination practices', 'Wisdom seeking rituals', 'Rest and restoration'],
    colors: ['deep purple', 'indigo', 'black'],
    crystals: ['amethyst', 'labradorite', 'lepidolite'],
    herbs: ['mugwort', 'lavender', 'passionflower']
  }
};

export class MoonPhaseService {
  private static instance: MoonPhaseService;

  static getInstance(): MoonPhaseService {
    if (!MoonPhaseService.instance) {
      MoonPhaseService.instance = new MoonPhaseService();
    }
    return MoonPhaseService.instance;
  }

  private async getUserLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback to London coordinates
        resolve({ lat: 51.4768, lon: -0.0004 });
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Geolocation timeout'));
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('Geolocation failed:', error);
          // Fallback to London coordinates
          resolve({ lat: 51.4768, lon: -0.0004 });
        },
        {
          timeout: 9000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private getCachedData(): MoonPhaseDisplayData | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;

      const data: MoonPhaseDisplayData = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - data.cached_at < CACHE_DURATION) {
        return data;
      }
      
      // Cache expired
      localStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (error) {
      console.warn('Failed to read cached moon phase data:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private setCachedData(data: MoonPhaseDisplayData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache moon phase data:', error);
    }
  }

  private getSpiritualSignificance(phaseName: string): SpiritualSignificance {
    return SPIRITUAL_SIGNIFICANCE[phaseName] || SPIRITUAL_SIGNIFICANCE['New Moon'];
  }

  async fetchMoonPhaseData(forceRefresh = false): Promise<MoonPhaseDisplayData | MoonPhaseError> {
    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = this.getCachedData();
        if (cached) {
          return cached;
        }
      }

      // Check if API key is configured
      if (!MOON_PHASE_API_KEY) {
        throw new Error('Moon Phase API key not configured. Please set NEXT_PUBLIC_MOON_PHASE_API_KEY in your environment variables.');
      }

      // Get user location
      const location = await this.getUserLocation();

      // Fetch from API
      const response = await fetch(
        `https://moon-phase.p.rapidapi.com/advanced?lat=${location.lat}&lon=${location.lon}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': MOON_PHASE_API_HOST,
            'x-rapidapi-key': MOON_PHASE_API_KEY
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Moon phase API error:', errorText);
        
        // Return cached data if available, even if expired
        const cached = this.getCachedData();
        if (cached) {
          return cached;
        }

        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData: MoonPhaseApiResponse = await response.json();
      
      // Add spiritual significance and cache metadata
      const enhancedData: MoonPhaseDisplayData = {
        ...apiData,
        spiritual_significance: this.getSpiritualSignificance(apiData.moon.phase_name),
        cached_at: Date.now(),
        next_update: Date.now() + CACHE_DURATION
      };

      // Cache the data
      this.setCachedData(enhancedData);

      return enhancedData;

    } catch (error) {
      console.error('Failed to fetch moon phase data:', error);
      
      // Try to return cached data as fallback
      const cached = this.getCachedData();
      if (cached) {
        return cached;
      }

      return {
        error: error instanceof Error ? error.message : 'Failed to fetch moon phase data',
        code: 'FETCH_ERROR'
      };
    }
  }

  async getTimeToNextPhase(): Promise<{ phase: string; timeUntil: string; timestamp: number } | null> {
    try {
      const data = await this.fetchMoonPhaseData();
      
      if ('error' in data) {
        return null;
      }

      // Find the next phase
      const phases = [
        { name: 'New Moon', data: data.moon_phases.new_moon.next },
        { name: 'First Quarter', data: data.moon_phases.first_quarter.next },
        { name: 'Full Moon', data: data.moon_phases.full_moon.next },
        { name: 'Last Quarter', data: data.moon_phases.last_quarter.next }
      ];

      // Sort by timestamp to find the next one
      phases.sort((a, b) => a.data.timestamp - b.data.timestamp);
      const nextPhase = phases[0];

      if (!nextPhase) return null;

      const now = Date.now() / 1000; // Convert to seconds
      const secondsUntil = nextPhase.data.timestamp - now;
      
      // Format time until
      const days = Math.floor(secondsUntil / 86400);
      const hours = Math.floor((secondsUntil % 86400) / 3600);
      const minutes = Math.floor((secondsUntil % 3600) / 60);

      let timeUntil = '';
      if (days > 0) {
        timeUntil = `${days} day${days === 1 ? '' : 's'}`;
        if (hours > 0) timeUntil += `, ${hours} hour${hours === 1 ? '' : 's'}`;
      } else if (hours > 0) {
        timeUntil = `${hours} hour${hours === 1 ? '' : 's'}`;
        if (minutes > 0) timeUntil += `, ${minutes} minute${minutes === 1 ? '' : 's'}`;
      } else {
        timeUntil = `${minutes} minute${minutes === 1 ? '' : 's'}`;
      }

      return {
        phase: nextPhase.name,
        timeUntil,
        timestamp: nextPhase.data.timestamp
      };

    } catch (error) {
      console.error('Failed to calculate time to next phase:', error);
      return null;
    }
  }

  // Get upcoming moon phases for calendar view
  async getUpcomingPhases(count = 8): Promise<Array<{ name: string; date: Date; daysFromNow: number }>> {
    try {
      const data = await this.fetchMoonPhaseData();
      
      if ('error' in data) {
        return [];
      }

      const phases = [
        { name: 'New Moon', timestamp: data.moon_phases.new_moon.next.timestamp },
        { name: 'First Quarter', timestamp: data.moon_phases.first_quarter.next.timestamp },
        { name: 'Full Moon', timestamp: data.moon_phases.full_moon.next.timestamp },
        { name: 'Last Quarter', timestamp: data.moon_phases.last_quarter.next.timestamp }
      ];

      // Generate multiple cycles
      const upcoming = [];
      const cycleLength = 29.5 * 24 * 60 * 60; // ~29.5 days in seconds
      
      for (let cycle = 0; cycle < Math.ceil(count / 4); cycle++) {
        for (const phase of phases) {
          const timestamp = phase.timestamp + (cycle * cycleLength);
          const date = new Date(timestamp * 1000);
          const now = new Date();
          const daysFromNow = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (upcoming.length < count) {
            upcoming.push({
              name: phase.name,
              date,
              daysFromNow
            });
          }
        }
      }

      // Sort by date and return requested count
      return upcoming
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, count);

    } catch (error) {
      console.error('Failed to get upcoming phases:', error);
      return [];
    }
  }

  // Clear cache
  clearCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear moon phase cache:', error);
    }
  }
}

export const moonPhaseService = MoonPhaseService.getInstance();
