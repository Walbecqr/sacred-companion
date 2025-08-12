import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface SeasonalContent {
  id: string;
  name: string;
  seasonal_type: string;
  start_date: string;
  end_date: string;
  recurring_pattern: string;
  content_boost_factor: number;
  description?: string;
  spiritual_themes: string[];
  associated_correspondences: Record<string, unknown>;
  is_active: boolean;
}

// Get current seasonal context
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const timezone = searchParams.get('timezone') || 'UTC';

    // Get current seasonal events
    const { data: seasonalEvents, error } = await supabase
      .from('seasonal_content_calendar')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', date)
      .gte('end_date', date)
      .order('content_boost_factor', { ascending: false });

    if (error) {
      console.error('Error fetching seasonal content:', error);
      return NextResponse.json({ error: 'Failed to fetch seasonal content' }, { status: 500 });
    }

    // Calculate moon phase
    const moonPhase = calculateMoonPhase(new Date(date));

    // Get seasonal correspondences for the day
    const dayOfWeek = new Date(date).getDay();
    const planetaryCorrespondence = getPlanetaryCorrespondence(dayOfWeek);

    // Check for upcoming events (within 7 days)
    const weekAhead = new Date(date);
    weekAhead.setDate(weekAhead.getDate() + 7);

    const { data: upcomingEvents } = await supabase
      .from('seasonal_content_calendar')
      .select('*')
      .eq('is_active', true)
      .gte('start_date', date)
      .lte('start_date', weekAhead.toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(3);

    return NextResponse.json({
      date,
      timezone,
      active_seasons: seasonalEvents || [],
      moon_phase: moonPhase,
      planetary_correspondence: planetaryCorrespondence,
      upcoming_events: upcomingEvents || [],
      seasonal_boost_active: (seasonalEvents || []).length > 0
    });

  } catch (error) {
    console.error('Error in seasonal endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateMoonPhase(date: Date): { phase: string; illumination: number; name: string } {
  // Simplified moon phase calculation
  // In a real app, you might use a more accurate lunar calculation library
  const lunarMonth = 29.53058867; // Average lunar month in days
  const knownNewMoon = new Date('2000-01-06'); // Known new moon date
  
  const daysSinceKnownNew = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentLunarDay = daysSinceKnownNew % lunarMonth;
  
  let phase: string;
  let illumination: number;
  let name: string;
  
  if (currentLunarDay < 1) {
    phase = 'new';
    illumination = 0;
    name = 'New Moon 🌑';
  } else if (currentLunarDay < 7.4) {
    phase = 'waxing_crescent';
    illumination = currentLunarDay / 7.4 * 0.5;
    name = 'Waxing Crescent 🌒';
  } else if (currentLunarDay < 8.4) {
    phase = 'first_quarter';
    illumination = 0.5;
    name = 'First Quarter 🌓';
  } else if (currentLunarDay < 14.8) {
    phase = 'waxing_gibbous';
    illumination = 0.5 + ((currentLunarDay - 7.4) / 7.4 * 0.5);
    name = 'Waxing Gibbous 🌔';
  } else if (currentLunarDay < 15.8) {
    phase = 'full';
    illumination = 1;
    name = 'Full Moon 🌕';
  } else if (currentLunarDay < 22.1) {
    phase = 'waning_gibbous';
    illumination = 1 - ((currentLunarDay - 14.8) / 7.3 * 0.5);
    name = 'Waning Gibbous 🌖';
  } else if (currentLunarDay < 23.1) {
    phase = 'last_quarter';
    illumination = 0.5;
    name = 'Last Quarter 🌗';
  } else {
    phase = 'waning_crescent';
    illumination = 0.5 - ((currentLunarDay - 22.1) / 7.4 * 0.5);
    name = 'Waning Crescent 🌘';
  }
  
  return {
    phase,
    illumination: Math.max(0, Math.min(1, illumination)),
    name
  };
}

function getPlanetaryCorrespondence(dayOfWeek: number): { day: string; planet: string; element: string; colors: string[]; herbs: string[]; themes: string[] } {
  const correspondences = [
    {
      day: 'Sunday',
      planet: 'Sun',
      element: 'Fire',
      colors: ['Gold', 'Yellow', 'Orange'],
      herbs: ['Bay', 'Calendula', 'Chamomile', 'Cinnamon'],
      themes: ['Success', 'Leadership', 'Healing', 'Vitality', 'Father figures']
    },
    {
      day: 'Monday',
      planet: 'Moon',
      element: 'Water',
      colors: ['Silver', 'White', 'Pale Blue'],
      herbs: ['Jasmine', 'Moonstone', 'Sandalwood', 'Willow'],
      themes: ['Intuition', 'Dreams', 'Emotions', 'Fertility', 'Mother figures']
    },
    {
      day: 'Tuesday',
      planet: 'Mars',
      element: 'Fire',
      colors: ['Red', 'Scarlet', 'Orange'],
      herbs: ['Ginger', 'Nettle', 'Thistle', 'Dragon\'s Blood'],
      themes: ['Courage', 'Action', 'Passion', 'Conflict resolution', 'Physical strength']
    },
    {
      day: 'Wednesday',
      planet: 'Mercury',
      element: 'Air',
      colors: ['Yellow', 'Violet', 'Gray'],
      herbs: ['Lavender', 'Mint', 'Fennel', 'Caraway'],
      themes: ['Communication', 'Learning', 'Travel', 'Technology', 'Wit']
    },
    {
      day: 'Thursday',
      planet: 'Jupiter',
      element: 'Air',
      colors: ['Blue', 'Purple', 'Turquoise'],
      herbs: ['Sage', 'Oak', 'Nutmeg', 'Cedar'],
      themes: ['Expansion', 'Higher learning', 'Philosophy', 'Justice', 'Abundance']
    },
    {
      day: 'Friday',
      planet: 'Venus',
      element: 'Water',
      colors: ['Green', 'Pink', 'Copper'],
      herbs: ['Rose', 'Apple', 'Strawberry', 'Thyme'],
      themes: ['Love', 'Beauty', 'Harmony', 'Arts', 'Relationships']
    },
    {
      day: 'Saturday',
      planet: 'Saturn',
      element: 'Earth',
      colors: ['Black', 'Dark Blue', 'Brown'],
      herbs: ['Comfrey', 'Mullein', 'Cypress', 'Myrrh'],
      themes: ['Discipline', 'Boundaries', 'Time', 'Karma', 'Ancestry']
    }
  ];
  
  return correspondences[dayOfWeek];
}

// Create or update seasonal content (admin endpoint)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This would typically require admin privileges
    // For now, we'll allow authenticated users to suggest seasonal content
    
    const body = await request.json();
    const {
      name,
      seasonal_type,
      start_date,
      end_date,
      recurring_pattern,
      description,
      spiritual_themes,
      associated_correspondences
    } = body;

    if (!name || !seasonal_type || !start_date) {
      return NextResponse.json({ error: 'Name, seasonal type, and start date are required' }, { status: 400 });
    }

    const { data: newSeasonalContent, error } = await supabase
      .from('seasonal_content_calendar')
      .insert({
        name,
        seasonal_type,
        start_date,
        end_date: end_date || start_date,
        recurring_pattern: recurring_pattern || 'yearly',
        description,
        spiritual_themes: spiritual_themes || [],
        associated_correspondences: associated_correspondences || {},
        content_boost_factor: 1.5,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating seasonal content:', error);
      return NextResponse.json({ error: 'Failed to create seasonal content' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Seasonal content created successfully',
      seasonal_content: newSeasonalContent
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create seasonal content endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
