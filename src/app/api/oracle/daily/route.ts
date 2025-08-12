import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface OracleCard {
  id: string;
  title: string;
  content: string;
  card_type: string;
  spiritual_paths: string[];
  experience_levels: string[];
  seasonal_timing: string[];
  correspondences: Record<string, unknown>;
  tags: string[];
  source?: string;
  image_url?: string;
}

interface DailyOracleState {
  id: string;
  user_id: string;
  oracle_date: string;
  timezone: string;
  daily_card_id?: string;
  manual_draws_count: number;
  manual_draws_limit: number;
  last_draw_at?: string;
}

interface UserProfile {
  user_id: string;
  spiritual_path?: string[];
  experience_level?: string;
}

// Get daily oracle card for user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timezone = searchParams.get('timezone') || 'UTC';
    const forceNew = searchParams.get('force_new') === 'true';

    // Get user's timezone-adjusted date
    const userDate = new Date().toLocaleDateString('en-CA', { timeZone: timezone });

    // Get or create daily oracle state
    let { data: dailyState, error: stateError } = await supabase
      .from('daily_oracle_state')
      .select('*')
      .eq('user_id', user.id)
      .eq('oracle_date', userDate)
      .single();

    if (stateError && stateError.code !== 'PGRST116') {
      console.error('Error fetching daily oracle state:', stateError);
      return NextResponse.json({ error: 'Failed to fetch oracle state' }, { status: 500 });
    }

    // If no daily state exists or forcing new card, get a new card
    if (!dailyState || forceNew) {
      const newCard = await selectDailyOracleCard(supabase, user.id, timezone);
      
      if (!newCard) {
        return NextResponse.json({ error: 'No oracle cards available' }, { status: 404 });
      }

      // Update or create daily state
      if (dailyState && forceNew) {
        // Manual draw - check limits
        if (dailyState.manual_draws_count >= dailyState.manual_draws_limit) {
          return NextResponse.json({ 
            error: 'Daily draw limit reached',
            limit: dailyState.manual_draws_limit,
            remaining: 0
          }, { status: 429 });
        }

        // Increment manual draws count
        const { error: updateError } = await supabase
          .from('daily_oracle_state')
          .update({
            daily_card_id: newCard.id,
            manual_draws_count: dailyState.manual_draws_count + 1,
            last_draw_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', dailyState.id);

        if (updateError) {
          console.error('Error updating daily oracle state:', updateError);
          return NextResponse.json({ error: 'Failed to update oracle state' }, { status: 500 });
        }

        dailyState.manual_draws_count += 1;
        dailyState.daily_card_id = newCard.id;
      } else {
        // Create new daily state
        const { data: newState, error: createError } = await supabase
          .from('daily_oracle_state')
          .insert({
            user_id: user.id,
            oracle_date: userDate,
            timezone: timezone,
            daily_card_id: newCard.id,
            manual_draws_count: forceNew ? 1 : 0,
            last_draw_at: forceNew ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily oracle state:', createError);
          return NextResponse.json({ error: 'Failed to create oracle state' }, { status: 500 });
        }

        dailyState = newState;
      }

      // Record the interaction
      await supabase
        .from('user_oracle_interactions')
        .insert({
          user_id: user.id,
          oracle_card_id: newCard.id,
          interaction_type: 'draw',
          interaction_date: userDate,
          metadata: { timezone, manual_draw: forceNew }
        });

      return NextResponse.json({
        card: newCard,
        is_manual_draw: forceNew,
        draws_remaining: dailyState.manual_draws_limit - dailyState.manual_draws_count,
        draws_limit: dailyState.manual_draws_limit
      });
    }

    // Get existing daily card
    const { data: dailyCard, error: cardError } = await supabase
      .from('oracle_cards')
      .select('*')
      .eq('id', dailyState.daily_card_id!)
      .eq('is_active', true)
      .single();

    if (cardError || !dailyCard) {
      // Card doesn't exist or is inactive, get a new one
      const newCard = await selectDailyOracleCard(supabase, user.id, timezone);
      
      if (!newCard) {
        return NextResponse.json({ error: 'No oracle cards available' }, { status: 404 });
      }

      // Update daily state with new card
      await supabase
        .from('daily_oracle_state')
        .update({
          daily_card_id: newCard.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', dailyState.id);

      return NextResponse.json({
        card: newCard,
        is_manual_draw: false,
        draws_remaining: dailyState.manual_draws_limit - dailyState.manual_draws_count,
        draws_limit: dailyState.manual_draws_limit
      });
    }

    return NextResponse.json({
      card: dailyCard,
      is_manual_draw: false,
      draws_remaining: dailyState.manual_draws_limit - dailyState.manual_draws_count,
      draws_limit: dailyState.manual_draws_limit
    });

  } catch (error) {
    console.error('Error in daily oracle endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function selectDailyOracleCard(supabase: any, userId: string, timezone: string): Promise<OracleCard | null> {
  try {
    // Get user's spiritual profile for personalization
    const { data: profile } = await supabase
      .from('user_spiritual_profiles')
      .select('spiritual_path, experience_level')
      .eq('user_id', userId)
      .single();

    // Get current seasonal context
    const currentDate = new Date().toISOString().split('T')[0];
    const { data: seasonalContext } = await supabase
      .from('seasonal_content_calendar')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', currentDate)
      .gte('end_date', currentDate);

    // Build query for oracle cards
    let query = supabase
      .from('oracle_cards')
      .select('*')
      .eq('is_active', true);

    // Apply spiritual path filtering if user has preferences
    const userPaths = profile?.spiritual_path || [];
    if (userPaths.length > 0) {
      // Prefer cards that match user's spiritual paths, but allow general ones too
      query = query.or(`spiritual_paths.cs.{${userPaths.join(',')}},spiritual_paths.cs.{general}`);
    }

    // Apply experience level filtering
    const userLevel = profile?.experience_level || 'beginner';
    query = query.contains('experience_levels', [userLevel]);

    const { data: availableCards, error } = await query;

    if (error) {
      console.error('Error fetching oracle cards:', error);
      return null;
    }

    if (!availableCards || availableCards.length === 0) {
      // Fallback to any active card if no matches
      const { data: fallbackCards } = await supabase
        .from('oracle_cards')
        .select('*')
        .eq('is_active', true)
        .limit(50);

      if (!fallbackCards || fallbackCards.length === 0) {
        return null;
      }

      return fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
    }

    // Apply seasonal boosting
    let weightedCards = availableCards.map((card: OracleCard) => {
      let weight = 1.0;
      
      // Boost seasonal cards if we're in their season
      if (seasonalContext && seasonalContext.length > 0) {
        const activeSeasons = seasonalContext.map((s: any) => s.name.toLowerCase());
        const cardSeasons = card.seasonal_timing || [];
        
        if (cardSeasons.some(season => 
          activeSeasons.some(activeSeason => 
            season.toLowerCase().includes(activeSeason) || 
            activeSeason.includes(season.toLowerCase())
          )
        )) {
          weight *= 2.0; // Boost seasonal relevance
        }
      }

      // Boost cards that match user's spiritual path more closely
      if (userPaths.length > 0 && card.spiritual_paths) {
        const matchCount = card.spiritual_paths.filter(path => 
          userPaths.includes(path) && path !== 'general'
        ).length;
        
        if (matchCount > 0) {
          weight *= (1 + matchCount * 0.5);
        }
      }

      return { card, weight };
    });

    // Select weighted random card
    const totalWeight = weightedCards.reduce((sum, item) => sum + item.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    
    for (const item of weightedCards) {
      randomWeight -= item.weight;
      if (randomWeight <= 0) {
        return item.card;
      }
    }

    // Fallback to first card
    return weightedCards[0]?.card || null;

  } catch (error) {
    console.error('Error selecting oracle card:', error);
    return null;
  }
}
